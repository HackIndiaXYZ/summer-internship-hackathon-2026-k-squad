const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.use(auth);

// ─── GENERATE AI INSIGHTS ─────────────────────────────────────────────────────
router.post('/generate', async (req, res) => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonthTx, lastMonthTx] = await Promise.all([
      Transaction.find({ userId: req.user._id, date: { $gte: thisMonthStart } }),
      Transaction.find({ userId: req.user._id, date: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);

    const buildSummary = (txns) => ({
      totalSpend: txns.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0),
      totalIncome: txns.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0),
      count: txns.length,
      categories: txns.reduce((acc, t) => {
        if (t.type === 'debit') acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {}),
      topMerchants: [...new Set(txns.map(t => t.merchant))].slice(0, 8),
      recurring: txns.filter(t => t.isRecurring).map(t => t.merchant),
    });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: `You are a smart personal finance AI for Indian users. Provide actionable, specific financial insights.
Return ONLY valid JSON (no markdown):
{
  "insights": [
    {
      "type": "alert|warning|suggestion|info",
      "title": "max 6 words",
      "description": "2-3 sentences, specific and actionable",
      "icon": "alert|trending|calendar|savings|subscription|info|target",
      "priority": 1-3
    }
  ],
  "spendingScore": 0-100,
  "savingsRate": number,
  "predictedMonthlySpend": number
}`,
      messages: [{
        role: 'user',
        content: `Analyze finances for an Indian user:

This month: ${JSON.stringify(buildSummary(thisMonthTx))}
Last month: ${JSON.stringify(buildSummary(lastMonthTx))}
Monthly budget: ₹${req.user.monthlyBudget || 'not set'}
Category budgets: ${JSON.stringify(req.user.categoryBudgets)}

Generate 5-7 personalized insights.`,
      }],
    });

    const text = response.content[0].text.replace(/```json|```/g, '').trim();
    const insights = JSON.parse(text);

    res.json(insights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DETECT SUBSCRIPTIONS ─────────────────────────────────────────────────────
router.get('/subscriptions', async (req, res) => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recurring = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'debit', date: { $gte: threeMonthsAgo } } },
      { $group: { _id: '$merchant', count: { $sum: 1 }, avgAmount: { $avg: '$amount' }, lastDate: { $max: '$date' }, category: { $first: '$category' } } },
      { $match: { count: { $gte: 2 } } },
      { $sort: { count: -1 } },
    ]);

    const subscriptionKeywords = ['netflix', 'spotify', 'amazon prime', 'hotstar', 'youtube', 'linkedin', 'adobe', 'microsoft'];
    const likely = recurring.filter(r =>
      subscriptionKeywords.some(k => r._id.toLowerCase().includes(k)) ||
      (r.avgAmount < 2000 && r.count >= 2)
    );

    res.json({ subscriptions: likely, totalMonthly: likely.reduce((s, r) => s + r.avgAmount, 0) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SPENDING PREDICTION ──────────────────────────────────────────────────────
router.get('/predict', async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthly = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'debit', date: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const amounts = monthly.map(m => m.total);
    const avg = amounts.reduce((s, a) => s + a, 0) / (amounts.length || 1);
    const trend = amounts.length >= 2 ? (amounts[amounts.length - 1] - amounts[0]) / amounts.length : 0;

    res.json({
      historicalMonthly: monthly,
      predictedNextMonth: Math.max(0, avg + trend),
      averageMonthly: avg,
      trendDirection: trend > 500 ? 'increasing' : trend < -500 ? 'decreasing' : 'stable',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
