const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

router.use(auth);

// ─── GET BUDGET ───────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    let budget = await Budget.findOne({ userId: req.user._id });
    if (!budget) budget = await Budget.create({ userId: req.user._id });

    // Get this month's spend per category
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const categorySpend = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'debit', date: { $gte: start } } },
      { $group: { _id: '$category', spent: { $sum: '$amount' } } },
    ]);

    const spendMap = Object.fromEntries(categorySpend.map(c => [c._id, c.spent]));
    const totalSpent = Object.values(spendMap).reduce((s, v) => s + v, 0);

    // Check for budget alerts and create notifications
    const alerts = budget.checkOverBudget(spendMap);
    for (const alert of alerts) {
      const exists = await Notification.findOne({
        userId: req.user._id,
        type: alert.type === 'exceeded' ? 'overspend' : 'budget_alert',
        'data.category': alert.category,
        createdAt: { $gte: start },
      });
      if (!exists) {
        await Notification.create({
          userId: req.user._id,
          type: alert.type === 'exceeded' ? 'overspend' : 'budget_alert',
          severity: alert.type === 'exceeded' ? 'critical' : 'warning',
          title: alert.type === 'exceeded' ? `${alert.category} budget exceeded!` : `${alert.category} budget at ${alert.pct}%`,
          message: `You've spent ₹${alert.spend.toLocaleString('en-IN')} of your ₹${alert.limit.toLocaleString('en-IN')} ${alert.category} budget.`,
          data: alert,
          actionUrl: `/transactions?category=${alert.category}`,
        });
      }
    }

    res.json({
      budget,
      spending: spendMap,
      totalSpent,
      totalBudget: budget.monthly,
      overallPct: budget.monthly > 0 ? Math.round((totalSpent / budget.monthly) * 100) : 0,
      alerts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── UPDATE BUDGET ────────────────────────────────────────────────────────────
router.put('/', async (req, res) => {
  try {
    const { monthly, categories, rollover } = req.body;
    let budget = await Budget.findOne({ userId: req.user._id });
    if (!budget) budget = new Budget({ userId: req.user._id });

    if (monthly !== undefined) budget.monthly = monthly;
    if (rollover !== undefined) budget.rollover = rollover;
    if (categories) {
      for (const [cat, vals] of Object.entries(categories)) {
        if (budget.categories[cat]) {
          if (vals.limit !== undefined) budget.categories[cat].limit = vals.limit;
          if (vals.alertAt !== undefined) budget.categories[cat].alertAt = vals.alertAt;
        }
      }
    }
    budget.markModified('categories');
    await budget.save();
    res.json({ budget, message: 'Budget updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── BUDGET HISTORY ───────────────────────────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const { months = 3 } = req.query;
    const results = [];
    const budget = await Budget.findOne({ userId: req.user._id });
    if (!budget) return res.json({ history: [] });

    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const spent = await Transaction.aggregate([
        { $match: { userId: req.user._id, type: 'debit', date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      results.push({
        month: d.toLocaleString('en-IN', { month: 'short', year: 'numeric' }),
        spent: spent[0]?.total || 0,
        budget: budget.monthly,
        withinBudget: (spent[0]?.total || 0) <= budget.monthly,
      });
    }
    res.json({ history: results.reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
