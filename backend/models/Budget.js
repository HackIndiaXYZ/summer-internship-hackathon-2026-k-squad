const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  monthly: { type: Number, default: 0 },
  categories: {
    Food:          { limit: { type: Number, default: 0 }, alertAt: { type: Number, default: 80 } },
    Transport:     { limit: { type: Number, default: 0 }, alertAt: { type: Number, default: 80 } },
    Shopping:      { limit: { type: Number, default: 0 }, alertAt: { type: Number, default: 80 } },
    Bills:         { limit: { type: Number, default: 0 }, alertAt: { type: Number, default: 80 } },
    Entertainment: { limit: { type: Number, default: 0 }, alertAt: { type: Number, default: 80 } },
    Healthcare:    { limit: { type: Number, default: 0 }, alertAt: { type: Number, default: 80 } },
    Education:     { limit: { type: Number, default: 0 }, alertAt: { type: Number, default: 80 } },
    Other:         { limit: { type: Number, default: 0 }, alertAt: { type: Number, default: 80 } },
  },
  rollover: { type: Boolean, default: false }, // carry unspent budget to next month
  currency: { type: String, default: 'INR' },
}, { timestamps: true });

// Check if any category is over budget
budgetSchema.methods.checkOverBudget = function(categorySpend) {
  const alerts = [];
  for (const [cat, spend] of Object.entries(categorySpend)) {
    const budget = this.categories[cat];
    if (budget?.limit > 0) {
      const pct = (spend / budget.limit) * 100;
      if (pct >= 100) alerts.push({ category: cat, type: 'exceeded', pct: Math.round(pct), spend, limit: budget.limit });
      else if (pct >= budget.alertAt) alerts.push({ category: cat, type: 'warning', pct: Math.round(pct), spend, limit: budget.limit });
    }
  }
  return alerts;
};

module.exports = mongoose.model('Budget', budgetSchema);
