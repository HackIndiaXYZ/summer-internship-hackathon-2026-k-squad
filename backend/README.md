# Tracky 💳⚡
### AI-Powered Smart Expense Tracking & Financial Analytics Platform

> Automatically reads bank SMS messages, extracts spending data, categorizes expenses using AI, and generates real-time financial insights.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | JWT + Google OAuth, refresh tokens, secure sessions |
| 📱 **SMS Parsing** | Regex + Claude AI for Indian bank SMS parsing |
| 🧠 **AI Categorization** | Rule-based + Claude Haiku for smart expense categorization |
| 📊 **Dashboard** | Real-time balance, spend trends, category analytics |
| 💡 **AI Insights** | Anomaly detection, budget alerts, savings suggestions |
| 🔄 **Pattern Learning** | System learns user's spending habits over time |
| 📈 **Analytics** | Weekly/monthly reports, category breakdowns, predictions |
| 🔔 **Notifications** | Overspending alerts, subscription reminders |

---

## 📁 Folder Structure

```
tracky/
├── tracky-backend/
│   ├── server.js                 # Express app entry point
│   ├── package.json
│   ├── .env.example
│   ├── models/
│   │   ├── User.js               # User schema (auth, budgets, patterns)
│   │   └── Transaction.js        # Transaction schema + statics
│   ├── routes/
│   │   ├── auth.js               # Login, signup, Google OAuth, refresh
│   │   ├── transactions.js       # CRUD, search, filter, monthly summary
│   │   ├── sms.js                # SMS parse, import, batch import
│   │   ├── insights.js           # AI insights, subscriptions, predictions
│   │   └── analytics.js         # Dashboard, trends, weekly, reports
│   ├── middleware/
│   │   └── auth.js               # JWT verify, token generators
│   └── utils/
│       ├── smsParser.js          # Regex-based SMS parser (12+ banks)
│       └── categorizer.js       # Rule-based + AI categorizer + learner
│
└── tracky-frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx               # Router + auth state
        ├── store/
        │   ├── authStore.js      # Zustand auth state
        │   └── transactionStore.js
        ├── pages/
        │   ├── Auth.jsx          # Login/Signup page
        │   ├── Dashboard.jsx     # Main dashboard
        │   ├── Transactions.jsx  # Transaction list & search
        │   ├── SMSImport.jsx     # SMS paste & AI parse
        │   ├── Insights.jsx      # AI insights page
        │   └── Analytics.jsx    # Charts & reports
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.jsx
        │   │   └── TopBar.jsx
        │   ├── ui/
        │   │   ├── Card.jsx
        │   │   ├── Badge.jsx
        │   │   ├── Button.jsx
        │   │   └── Input.jsx
        │   ├── charts/
        │   │   ├── AreaTrend.jsx
        │   │   ├── CategoryPie.jsx
        │   │   └── WeeklyBar.jsx
        │   └── transactions/
        │       ├── TransactionRow.jsx
        │       └── TransactionFilters.jsx
        ├── hooks/
        │   ├── useTransactions.js
        │   ├── useInsights.js
        │   └── useAuth.js
        ├── lib/
        │   ├── api.js            # Axios instance with interceptors
        │   └── constants.js      # Categories, colors, etc.
        └── styles/
            └── globals.css       # Tailwind + custom vars
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Anthropic API key
- Google OAuth credentials (optional)

### Backend Setup

```bash
cd tracky-backend
npm install

cp .env.example .env
# Edit .env with your credentials

npm run dev
# Server starts at http://localhost:5000
```

### Frontend Setup

```bash
cd tracky-frontend
npm install

# Create .env
echo "VITE_API_URL=http://localhost:5000/api" > .env
echo "VITE_GOOGLE_CLIENT_ID=your_google_client_id" >> .env

npm run dev
# App starts at http://localhost:5173
```

---

## 🔌 API Reference

### Auth
```
POST /api/auth/signup          # Create account
POST /api/auth/login           # Login with email/password
POST /api/auth/google          # Google OAuth
POST /api/auth/refresh         # Refresh JWT
GET  /api/auth/me              # Get current user
PATCH /api/auth/profile        # Update profile/budgets
```

### Transactions
```
GET    /api/transactions        # List with filters & pagination
POST   /api/transactions        # Create (auto-categorizes)
PATCH  /api/transactions/:id    # Update (learns from corrections)
DELETE /api/transactions/:id    # Delete
GET    /api/transactions/summary/monthly  # Monthly totals
GET    /api/transactions/merchants/top    # Top merchants
```

### SMS
```
POST /api/sms/parse             # Parse single SMS (AI-enhanced)
POST /api/sms/import            # Save parsed transaction
POST /api/sms/batch             # Import up to 100 SMS at once
```

### Insights
```
POST /api/insights/generate     # Full AI insights report
GET  /api/insights/subscriptions # Detected recurring charges
GET  /api/insights/predict      # Spending predictions
```

### Analytics
```
GET /api/analytics/dashboard    # Summary stats
GET /api/analytics/categories   # Category breakdown
GET /api/analytics/trend        # N-month spending trend
GET /api/analytics/weekly       # Weekly spending
GET /api/analytics/report/:y/:m # Monthly PDF-ready report
```

---

## 🧠 AI Architecture

### SMS Parsing (2-stage)
1. **Regex Parser** — fast, offline, handles 12+ Indian banks
2. **Claude Haiku** — verifies, enhances, fills gaps

### Expense Categorization (3-stage)
1. **Learned Patterns** — user's own history (highest confidence)
2. **Rule Engine** — 150+ keyword mappings for Indian merchants
3. **Claude Haiku** — AI fallback for unknown merchants

### Financial Insights (Claude Sonnet)
- Anomaly detection (unusual spends)
- Budget burn rate analysis
- Subscription & recurring charge detection
- Personalized saving suggestions
- Month-over-month trend analysis

---

## 🌐 Deployment

### Backend (Railway / Render)
```bash
# Set environment variables in dashboard
# Deploy from GitHub
railway up
```

### Frontend (Vercel)
```bash
vercel --prod
# Set VITE_API_URL to your backend URL
```

### MongoDB
- Use [MongoDB Atlas](https://cloud.mongodb.com) free tier
- Whitelist your server IPs

---

## 📄 License
MIT © 2025 Tracky
