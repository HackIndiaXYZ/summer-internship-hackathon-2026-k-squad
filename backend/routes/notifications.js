const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

router.use(auth);

// ─── GET NOTIFICATIONS ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { unreadOnly, limit = 20, page = 1 } = req.query;
    const query = { userId: req.user._id };
    if (unreadOnly === 'true') query.read = false;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      Notification.unreadCount(req.user._id),
    ]);
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── MARK ONE AS READ ─────────────────────────────────────────────────────────
router.patch('/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    await notif.markRead();
    res.json({ notification: notif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── MARK ALL AS READ ─────────────────────────────────────────────────────────
router.patch('/read-all', async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );
    res.json({ updated: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE NOTIFICATION ──────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CLEAR ALL ────────────────────────────────────────────────────────────────
router.delete('/', async (req, res) => {
  try {
    const result = await Notification.deleteMany({ userId: req.user._id });
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GENERATE ALERTS (cron-triggered or manual) ───────────────────────────────
router.post('/check', async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const created = [];

    // 1. Detect unusual high-value transactions (>3x avg)
    const avgTx = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'debit', date: { $gte: weekAgo } } },
      { $group: { _id: null, avg: { $avg: '$amount' }, max: { $max: '$amount' } } },
    ]);
    if (avgTx[0] && avgTx[0].max > avgTx[0].avg * 3) {
      const unusual = await Transaction.findOne({
        userId: req.user._id, type: 'debit', amount: avgTx[0].max, date: { $gte: weekAgo }
      });
      if (unusual) {
        created.push(await Notification.create({
          userId: req.user._id,
          type: 'unusual_spend',
          severity: 'warning',
          title: 'Unusual transaction detected',
          message: `₹${unusual.amount.toLocaleString('en-IN')} at ${unusual.merchant} is 3× your weekly average.`,
          data: { transactionId: unusual._id, amount: unusual.amount, merchant: unusual.merchant },
        }));
      }
    }

    // 2. Check subscriptions due (next 3 days)
    const subscriptionMerchants = ['Netflix', 'Spotify', 'Amazon Prime', 'Hotstar', 'YouTube'];
    for (const merchant of subscriptionMerchants) {
      const last = await Transaction.findOne({
        userId: req.user._id, merchant: new RegExp(merchant, 'i'), type: 'debit'
      }).sort({ date: -1 });
      if (last) {
        const nextDue = new Date(last.date);
        nextDue.setMonth(nextDue.getMonth() + 1);
        const daysUntil = Math.ceil((nextDue - now) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 3) {
          created.push(await Notification.create({
            userId: req.user._id,
            type: 'subscription_due',
            severity: 'info',
            title: `${merchant} renewal in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
            message: `Your ${merchant} subscription of ₹${last.amount.toLocaleString('en-IN')} renews on ${nextDue.toLocaleDateString('en-IN')}.`,
            data: { merchant, amount: last.amount, dueDate: nextDue },
          }));
        }
      }
    }

    res.json({ created: created.length, notifications: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
