const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');
const { categorizeTransaction, learnFromFeedback } = require('../utils/categorizer');

// All routes require authentication
router.use(auth);

// ─── GET ALL TRANSACTIONS ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      page = 1, limit = 50, category, type, bank,
      startDate, endDate, search, sortBy = 'date', sortOrder = 'desc',
    } = req.query;

    const query = { userId: req.user._id };
    if (category && category !== 'All') query.category = category;
    if (type && type !== 'All') query.type = type;
    if (bank) query.bank = new RegExp(bank, 'i');
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { merchant: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { bank: new RegExp(search, 'i') },
      ];
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      transactions,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CREATE TRANSACTION ───────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { merchant, amount, type, description, bank, account, date, category, tags } = req.body;
    if (!merchant || !amount || !type) return res.status(400).json({ error: 'merchant, amount, type are required' });

    // Auto-categorize if no category provided
    let finalCategory = category;
    let aiConfidence = null;
    let aiCategorized = false;

    if (!category || category === 'Other') {
      const result = await categorizeTransaction(
        merchant, amount, description, req.user.spendingPatterns || [], true
      );
      finalCategory = result.category;
      aiConfidence = result.confidence;
      aiCategorized = result.method === 'ai';
    }

    const transaction = new Transaction({
      userId: req.user._id, merchant, amount: parseFloat(amount), type,
      category: finalCategory, bank, account, description,
      date: date ? new Date(date) : new Date(), tags,
      sourceType: 'manual', aiCategorized, aiConfidence,
    });

    await transaction.save();
    res.status(201).json({ transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── UPDATE TRANSACTION ───────────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    const allowed = ['merchant', 'amount', 'type', 'category', 'description', 'date', 'tags', 'isVerified'];
    allowed.forEach(field => { if (req.body[field] !== undefined) transaction[field] = req.body[field]; });

    // Learn from category correction
    if (req.body.category && req.body.category !== transaction.category) {
      const updatedPatterns = learnFromFeedback(
        req.user.spendingPatterns || [], transaction.merchant, req.body.category, transaction.amount
      );
      req.user.spendingPatterns = updatedPatterns;
      await req.user.save();
    }

    await transaction.save();
    res.json({ transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE TRANSACTION ───────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── BULK DELETE ──────────────────────────────────────────────────────────────
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) return res.status(400).json({ error: 'ids array required' });
    const result = await Transaction.deleteMany({ _id: { $in: ids }, userId: req.user._id });
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── MONTHLY SUMMARY ──────────────────────────────────────────────────────────
router.get('/summary/monthly', async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    const summary = await Transaction.getMonthlySummary(req.user._id, year, month);
    const breakdown = await Transaction.getCategoryBreakdown(
      req.user._id,
      new Date(year, month - 1, 1),
      new Date(year, month, 0, 23, 59, 59)
    );
    res.json({ summary, breakdown });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── MERCHANT HISTORY ─────────────────────────────────────────────────────────
router.get('/merchants/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const result = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'debit' } },
      { $group: { _id: '$merchant', total: { $sum: '$amount' }, count: { $sum: 1 }, category: { $first: '$category' } } },
      { $sort: { total: -1 } },
      { $limit: Number(limit) },
    ]);
    res.json({ merchants: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
