const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes         = require('./routes/auth');
const transactionRoutes  = require('./routes/transactions');
const smsRoutes          = require('./routes/sms');
const insightsRoutes     = require('./routes/insights');
const analyticsRoutes    = require('./routes/analytics');
const budgetRoutes       = require('./routes/budgets');
const notificationRoutes = require('./routes/notifications');
const exportRoutes       = require('./routes/export');

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests' });
app.use('/api/', limiter);

// ─── DATABASE ─────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tracky')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/transactions',  transactionRoutes);
app.use('/api/sms',           smsRoutes);
app.use('/api/insights',      insightsRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/budgets',       budgetRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/export',        exportRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Tracky server running on port ${PORT}`));

module.exports = app;
