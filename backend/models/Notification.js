const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['budget_alert', 'overspend', 'subscription_due', 'unusual_spend', 'weekly_report', 'tip', 'system'],
    required: true,
  },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed }, // extra metadata (amount, category, merchant, etc.)
  read: { type: Boolean, default: false, index: true },
  readAt: { type: Date },
  actionUrl: { type: String }, // deep-link e.g. /transactions?category=Food
  expiresAt: { type: Date },   // auto-hide after this date
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

// Mark as read
notificationSchema.methods.markRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Static: unread count
notificationSchema.statics.unreadCount = function(userId) {
  return this.countDocuments({ userId, read: false });
};

module.exports = mongoose.model('Notification', notificationSchema);
