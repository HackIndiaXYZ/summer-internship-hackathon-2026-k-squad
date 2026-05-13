const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

/**
 * Tracky Notification Service
 * Creates intelligent, context-aware alerts for users.
 */

// ─── CORE ALERT CREATORS ──────────────────────────────────────────────────────

const createNotification = async (userId, { type, severity = 'info', title, message, data, actionUrl }) => {
  try {
    return await Notification.create({ userId, type, severity, title, message, data, actionUrl });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
};

// ─── BUDGET ALERT ─────────────────────────────────────────────────────────────
const checkBudgetAlerts = async (userId) => {
  const budget = await Budget.findOne({ userId });
  if (!budget) return [];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const categorySpend = await Transaction.aggregate([
    { $match: { userId, type: 'debit', date: { $gte: monthStart } } },
    { $group: { _id: '$category', spent: { $sum: '$amount' } } },
  ]);

  const spendMap = Object.fromEntries(categorySpend.map(c => [c._id, c.spent]));
  const alerts = budget.checkOverBudget(spendMap);
  const created = [];

  for (const alert of alerts) {
    const existing = await Notification.findOne({
      userId,
      'data.category': alert.category,
      type: alert.type === 'exceeded' ? 'overspend' : 'budget_alert',
      createdAt: { $gte: monthStart },
    });
    if (!existing) {
      const n = await createNotification(userId, {
        type: alert.type === 'exceeded' ? 'overspend' : 'budget_alert',
        severity: alert.type === 'exceeded' ? 'critical' : 'warning',
        title: alert.type === 'exceeded'
          ? `${alert.category} budget exceeded 🚨`
          : `${alert.category} at ${alert.pct}% of budget`,
        message: `₹${alert.spend.toLocaleString('en-IN')} spent of ₹${alert.limit.toLocaleString('en-IN')} limit.`,
        data: alert,
        actionUrl: `/transactions?category=${alert.category}`,
      });
      if (n) created.push(n);
    }
  }
  return created;
};

// ─── NEW TRANSACTION ALERT ────────────────────────────────────────────────────
const onNewTransaction = async (userId, transaction) => {
  const alerts = [];

  // 1. Check budget impact
  const budgetAlerts = await checkBudgetAlerts(userId);
  alerts.push(...budgetAlerts);

  // 2. Flag large transactions (>₹5000)
  if (transaction.type === 'debit' && transaction.amount >= 5000) {
    const n = await createNotification(userId, {
      type: 'unusual_spend',
      severity: 'warning',
      title: `Large transaction: ${transaction.merchant}`,
      message: `₹${transaction.amount.toLocaleString('en-IN')} was debited from ${transaction.bank} ${transaction.account}. Tap to verify.`,
      data: { transactionId: transaction._id, amount: transaction.amount },
      actionUrl: `/transactions`,
    });
    if (n) alerts.push(n);
  }

  // 3. Detect recurring subscription charges
  const SUBSCRIPTION_KEYWORDS = ['netflix', 'spotify', 'prime', 'hotstar', 'linkedin', 'youtube premium', 'apple'];
  const isSubscription = SUBSCRIPTION_KEYWORDS.some(k => transaction.merchant.toLowerCase().includes(k));
  if (isSubscription && transaction.type === 'debit') {
    await createNotification(userId, {
      type: 'subscription_due',
      severity: 'info',
      title: `${transaction.merchant} subscription charged`,
      message: `₹${transaction.amount.toLocaleString('en-IN')} auto-charged for your ${transaction.merchant} subscription.`,
      data: { merchant: transaction.merchant, amount: transaction.amount },
    });
  }

  return alerts;
};

// ─── WEEKLY REPORT NOTIFICATION ───────────────────────────────────────────────
const sendWeeklyReport = async (userId) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const txns = await Transaction.find({ userId, type: 'debit', date: { $gte: weekAgo } });
  const totalSpent = txns.reduce((s, t) => s + t.amount, 0);
  const topCategory = txns.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const topCat = Object.entries(topCategory).sort(([, a], [, b]) => b - a)[0];

  return createNotification(userId, {
    type: 'weekly_report',
    severity: 'info',
    title: `Weekly report: ₹${totalSpent.toLocaleString('en-IN')} spent`,
    message: `You made ${txns.length} transactions this week. Top category: ${topCat ? topCat[0] : 'None'} (₹${topCat ? topCat[1].toLocaleString('en-IN') : 0}).`,
    data: { totalSpent, transactionCount: txns.length, topCategory: topCat?.[0], topAmount: topCat?.[1] },
    actionUrl: '/analytics',
  });
};

// ─── SAVING TIP NOTIFICATION ──────────────────────────────────────────────────
const sendSavingTip = async (userId, tip) => {
  return createNotification(userId, {
    type: 'tip',
    severity: 'info',
    title: '💡 Saving Tip',
    message: tip,
    actionUrl: '/insights',
  });
};

module.exports = {
  createNotification,
  checkBudgetAlerts,
  onNewTransaction,
  sendWeeklyReport,
  sendSavingTip,
};
