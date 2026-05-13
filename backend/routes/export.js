const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

router.use(auth);

// ─── EXPORT AS CSV ────────────────────────────────────────────────────────────
router.get('/csv', async (req, res) => {
  try {
    const { startDate, endDate, category, type } = req.query;
    const query = { userId: req.user._id };
    if (category && category !== 'All') query.category = category;
    if (type && type !== 'All') query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    const headers = ['Date', 'Merchant', 'Amount', 'Type', 'Category', 'Bank', 'Account', 'Description'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString('en-IN'),
      `"${t.merchant.replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      t.category,
      t.bank || '',
      t.account || '',
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const filename = `tracky-transactions-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── EXPORT AS JSON ───────────────────────────────────────────────────────────
router.get('/json', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });
    const totalSpend = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);

    res.setHeader('Content-Disposition', `attachment; filename="tracky-export-${new Date().toISOString().split('T')[0]}.json"`);
    res.json({
      exportedAt: new Date(),
      user: req.user.email,
      summary: { totalTransactions: transactions.length, totalSpend, totalIncome, netSavings: totalIncome - totalSpend },
      transactions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── IMPORT FROM JSON ─────────────────────────────────────────────────────────
router.post('/import-json', async (req, res) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions)) return res.status(400).json({ error: 'transactions array required' });
    if (transactions.length > 500) return res.status(400).json({ error: 'Max 500 transactions per import' });

    const docs = transactions.map(t => ({
      userId: req.user._id,
      merchant: t.merchant || 'Unknown',
      amount: parseFloat(t.amount) || 0,
      type: ['debit', 'credit'].includes(t.type) ? t.type : 'debit',
      category: t.category || 'Other',
      bank: t.bank,
      account: t.account,
      description: t.description,
      date: t.date ? new Date(t.date) : new Date(),
      sourceType: 'import',
    }));

    const inserted = await Transaction.insertMany(docs, { ordered: false });
    res.status(201).json({ imported: inserted.length, message: `${inserted.length} transactions imported` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
