const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 6 },
  googleId: { type: String },
  avatar: { type: String },
  phone: { type: String },
  currency: { type: String, default: 'INR' },
  monthlyBudget: { type: Number, default: 0 },
  categoryBudgets: {
    Food: { type: Number, default: 0 },
    Transport: { type: Number, default: 0 },
    Shopping: { type: Number, default: 0 },
    Bills: { type: Number, default: 0 },
    Entertainment: { type: Number, default: 0 },
    Healthcare: { type: Number, default: 0 },
    Education: { type: Number, default: 0 },
    Other: { type: Number, default: 0 },
  },
  notifications: {
    overspending: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
    subscriptionReminder: { type: Boolean, default: true },
  },
  spendingPatterns: [{ // AI learned patterns
    merchant: String,
    category: String,
    avgAmount: Number,
    frequency: Number,
    confidence: Number,
  }],
  lastLoginAt: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublic = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.googleId;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
