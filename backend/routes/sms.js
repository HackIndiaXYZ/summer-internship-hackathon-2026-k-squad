const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');
const { parseSMS, parseSMSBatch } = require('../utils/smsParser');
const { categorizeTransaction } = require('../utils/categorizer');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.use(auth);

// ─── PARSE SINGLE SMS WITH AI ────────────────────────────────────────────────
router.post('/parse', async (req, res) => {
  try {
    const { smsText, sender } = req.body;
    if (!smsText) return res.status(400).json({ error: 'smsText is required' });

    // First try regex-based parsing
    const regexResult = parseSMS(smsText, sender);

    // Enhance/verify with AI
    const aiResponse = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: `You are an expert at parsing Indian bank transaction SMS messages. Extract transaction data and return only JSON.
      
Return format: {"merchant":"string","amount":number,"type":"debit|credit","bank":"string","account":"****XXXX","category":"Food|Transport|Shopping|Bills|Entertainment|Healthcare|Education|Other","description":"string"}
If not a transaction SMS, return: {"error":"Not a transaction SMS"}`,
      messages: [{ role: 'user', content: `Parse SMS:\n${smsText}` }],
    });

    let parsed;
    try {
      const text = aiResponse.content[0].text.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(text);
      if (parsed.error) return res.status(400).json({ error: parsed.error });
    } catch {
      if (!regexResult.success) return res.status(400).json({ error: 'Could not parse SMS' });
      parsed = regexResult.data;
    }

    // Merge regex + AI results (AI takes precedence)
    const merged = {
      merchant: parsed.merchant || regexResult.data?.merchant || 'Unknown',
      amount: parsed.amount || regexResult.data?.amount,
      type: parsed.type || regexResult.data?.type || 'debit',
      bank: parsed.bank || regexResult.data?.bank || 'Unknown',
      account: parsed.account || regexResult.data?.account,
      category: parsed.category || 'Other',
      description: parsed.description || '',
      rawSms: smsText,
    };

    if (!merged.amount) return res.status(400).json({ error: 'Could not extract transaction amount' });

    res.json({ parsed: merged, regexParsed: regexResult.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PARSE AND SAVE SMS TRANSACTION ──────────────────────────────────────────
router.post('/import', async (req, res) => {
  try {
    const { parsed, confirmed } = req.body;
    if (!parsed || !confirmed) return res.status(400).json({ error: 'parsed data and confirmation required' });

    const transaction = new Transaction({
      userId: req.user._id,
      merchant: parsed.merchant,
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      bank: parsed.bank,
      account: parsed.account,
      description: parsed.description,
      date: parsed.date ? new Date(parsed.date) : new Date(),
      rawSms: parsed.rawSms,
      sourceType: 'sms',
      aiCategorized: true,
    });

    await transaction.save();
    res.status(201).json({ transaction, message: 'Transaction saved from SMS' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── BATCH SMS IMPORT ─────────────────────────────────────────────────────────
router.post('/batch', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages?.length) return res.status(400).json({ error: 'messages array required' });
    if (messages.length > 100) return res.status(400).json({ error: 'Max 100 messages per batch' });

    const parsed = parseSMSBatch(messages);
    const categorized = await Promise.all(
      parsed.map(async tx => {
        const cat = await categorizeTransaction(tx.merchant, tx.amount, '', req.user.spendingPatterns || []);
        return { ...tx, category: cat.category, aiConfidence: cat.confidence, aiCategorized: true };
      })
    );

    const transactions = await Transaction.insertMany(
      categorized.map(tx => ({ ...tx, userId: req.user._id, sourceType: 'sms' }))
    );

    res.status(201).json({ imported: transactions.length, transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
