const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  merchant: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ['debit', 'credit'], required: true },
  category: {
    type: String,
    enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other'],
    default: 'Other',
  },
  bank: { type: String, trim: true },
  account: { type: String, trim: true }, // masked e.g. ****4521
  description: { type: String, trim: true },
  date: { type: Date, default: Date.now, index: true },
  sourceType: { type: String, enum: ['sms', 'manual', 'import'], default: 'manual' },
  rawSms: { type: String }, // original SMS text
  isRecurring: { type: Boolean, default: false },
  recurringId: { type: String }, // group recurring transactions
  tags: [String],
  location: {
    city: String,
    coordinates: { lat: Number, lng: Number },
  },
  aiCategorized: { type: Boolean, default: false },
  aiConfidence: { type: Number, min: 0, max: 1 },
  isVerified: { type: Boolean, default: false }, // user verified the AI categorization
}, { timestamps: true });

// Indexes for common query patterns
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, merchant: 1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });

// Virtual: formatted amount with currency
transactionSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toLocaleString('en-IN')}`;
});

// Static: monthly summary
transactionSchema.statics.getMonthlySummary = async function(userId, year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
    { $group: {
      _id: '$type',
      total: { $sum: '$amount' },
      count: { $sum: 1 },
      avgAmount: { $avg: '$amount' },
    }},
  ]);
};

// Static: category breakdown
transactionSchema.statics.getCategoryBreakdown = async function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'debit',
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        transactions: { $push: { merchant: '$merchant', amount: '$amount', date: '$date' } },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);
