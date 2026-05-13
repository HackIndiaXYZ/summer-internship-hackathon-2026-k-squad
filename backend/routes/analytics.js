const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

router.use(auth);

// ─── DASHBOARD SUMMARY ────────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonth, lastMonth, allTime] = await Promise.all([
      Transaction.find({ userId: req.user._id, date: { $gte: monthStart } }),
      Transaction.find({ userId: req.user._id, date: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
      Transaction.find({ userId: req.user._id }),
    ]);

    const calcStats = (txns) => ({
      totalSpend: txns.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0),
      totalIncome: txns.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0),
      count: txns.length,
    });

    const current = calcStats(thisMonth);
    const previous = calcStats(lastMonth);

    const spendChange = previous.totalSpend > 0
      ? ((current.totalSpend - previous.totalSpend) / previous.totalSpend * 100).toFixed(1)
      : 0;

    res.json({
      current,
      previous,
      spendChange: Number(spendChange),
      savings: current.totalIncome - current.totalSpend,
      savingsRate: current.totalIncome > 0
        ? ((current.totalIncome - current.totalSpend) / current.totalIncome * 100).toFixed(1)
        : 0,
      totalTransactions: allTime.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CATEGORY BREAKDOWN ───────────────────────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    const breakdown = await Transaction.getCategoryBreakdown(req.user._id, start, end);
    res.json({ breakdown, period: { start, end } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SPENDING TREND (last N months) ──────────────────────────────────────────
router.get('/trend', async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    const trend = await Transaction.aggregate([
      { $match: { userId: req.user._id, date: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Reshape into { month, spend, income } format
    const monthMap = {};
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    trend.forEach(({ _id, total }) => {
      const key = `${_id.year}-${_id.month}`;
      if (!monthMap[key]) monthMap[key] = { month: monthNames[_id.month - 1], year: _id.year, spend: 0, income: 0 };
      if (_id.type === 'debit') monthMap[key].spend = total;
      if (_id.type === 'credit') monthMap[key].income = total;
    });

    res.json({ trend: Object.values(monthMap) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── WEEKLY SPENDING ──────────────────────────────────────────────────────────
router.get('/weekly', async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekly = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'debit', date: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const filled = days.map((day, i) => {
      const found = weekly.find(w => w._id === i + 1);
      return { day, amount: found?.total || 0, count: found?.count || 0 };
    });

    res.json({ weekly: filled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GENERATE MONTHLY REPORT ──────────────────────────────────────────────────
router.get('/report/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      userId: req.user._id, date: { $gte: start, $lte: end }
    }).sort({ date: -1 });

    const debits = transactions.filter(t => t.type === 'debit');
    const credits = transactions.filter(t => t.type === 'credit');

    const categoryBreakdown = await Transaction.getCategoryBreakdown(req.user._id, start, end);

    res.json({
      period: { year: Number(year), month: Number(month), start, end },
      summary: {
        totalSpend: debits.reduce((s, t) => s + t.amount, 0),
        totalIncome: credits.reduce((s, t) => s + t.amount, 0),
        transactionCount: transactions.length,
        avgDailySpend: debits.reduce((s, t) => s + t.amount, 0) / new Date(year, month, 0).getDate(),
      },
      categoryBreakdown,
      transactions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
