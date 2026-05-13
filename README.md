# ⚡ Tracky — AI-Powered Smart Expense Tracker

> Automatically reads bank SMS messages, extracts spending data, categorizes
> expenses with AI, and delivers real-time financial insights.

---

## 🚀 Quick Start (5 minutes)

### Step 1 — Install dependencies
```bash
# From the root tracky/ folder:
cd backend  && npm install
cd ../frontend && npm install
```

### Step 2 — Configure environment
```bash
# Backend
cd backend
cp .env.example .env
# Open .env and fill in:
#   MONGO_URI        → your MongoDB connection string
#   JWT_SECRET       → any random 64-char string
#   ANTHROPIC_API_KEY → your Claude API key (sk-ant-...)

# Frontend
cd ../frontend
cp .env.example .env
# VITE_API_URL is already set to http://localhost:5000/api
```

### Step 3 — Start both servers
```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

### Step 4 — Open the app
```
http://localhost:5173
```
Sign in with any email/password — it works offline with mock data too.

---

## 📁 Project Structure

```
tracky/
├── README.md
├── package.json                  ← root scripts (optional)
│
├── backend/                      ← Node.js + Express + MongoDB
│   ├── server.js                 ← Express app entry point
│   ├── .env.example
│   ├── models/
│   │   ├── User.js               ← Auth, budgets, learned patterns
│   │   ├── Transaction.js        ← Transactions + statics
│   │   ├── Budget.js             ← Per-category budget limits
│   │   └── Notification.js       ← Alert system
│   ├── routes/
│   │   ├── auth.js               ← Login, signup, Google OAuth, refresh
│   │   ├── transactions.js       ← CRUD, search, filter, CSV
│   │   ├── sms.js                ← AI SMS parsing + batch import
│   │   ├── insights.js           ← Claude AI insights + predictions
│   │   ├── analytics.js          ← Charts data, trends, reports
│   │   ├── budgets.js            ← Budget CRUD + alert triggers
│   │   ├── notifications.js      ← Notification management
│   │   └── export.js             ← CSV / JSON export + import
│   ├── middleware/
│   │   └── auth.js               ← JWT verify + token generators
│   └── utils/
│       ├── smsParser.js          ← Regex SMS parser (12+ banks)
│       ├── categorizer.js        ← 3-stage AI categorization
│       └── notificationService.js← Smart alert triggers
│
└── frontend/                     ← React + Vite + Tailwind
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example
    └── src/
        ├── main.jsx              ← ReactDOM entry
        ├── App.jsx               ← Router + shell + theme
        ├── index.css             ← Design tokens + global styles
        ├── lib/
        │   ├── constants.js      ← Categories, mock data, helpers
        │   └── api.js            ← Axios instance + JWT interceptors
        ├── store/
        │   ├── authStore.js      ← Zustand auth state
        │   └── transactionStore.js ← Zustand transactions
        ├── pages/
        │   ├── Auth.jsx          ← Login / Signup / Google OAuth
        │   ├── Dashboard.jsx     ← Stats, charts, recent transactions
        │   ├── Transactions.jsx  ← List, search, filter, CSV export
        │   ├── SMSImport.jsx     ← Paste SMS → Claude AI → save
        │   ├── Insights.jsx      ← Claude Sonnet financial analysis
        │   ├── Analytics.jsx     ← Weekly/monthly charts
        │   ├── Budgets.jsx       ← Budget gauge + category limits
        │   └── Settings.jsx      ← Profile, notifs, theme, export
        └── components/
            ├── layout/
            │   ├── Sidebar.jsx
            │   ├── TopBar.jsx
            │   └── NotifDrawer.jsx
            └── ui/
                ├── index.jsx     ← Tag, GaugeArc, Toggle, StatCard
                └── TransactionRow.jsx
```

---

## 🔑 Environment Variables

### `backend/.env`
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret (generate randomly) |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `ANTHROPIC_API_KEY` | Your Claude API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `CLIENT_URL` | Frontend URL (default: http://localhost:5173) |

### `frontend/.env`
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |

---

## 🧠 AI Architecture

### SMS Parsing (2-stage)
1. **Regex Parser** — Offline, handles 12+ Indian banks instantly
2. **Claude Haiku** — Verifies, enhances, fills gaps

### Expense Categorization (3-stage priority)
1. **Learned Patterns** — User's own correction history (highest confidence)
2. **Rule Engine** — 150+ keyword mappings for Indian merchants
3. **Claude Haiku** — Fallback for unknown merchants

### Financial Insights (Claude Sonnet)
- Spending health score (0–100)
- Budget burn rate alerts
- Subscription & recurring detection
- Personalized saving suggestions
- Month-over-month trend analysis

---

## 🌐 API Reference

```
POST   /api/auth/signup              Register new user
POST   /api/auth/login               Email/password login
POST   /api/auth/google              Google OAuth
POST   /api/auth/refresh             Refresh JWT token
GET    /api/auth/me                  Get current user
PATCH  /api/auth/profile             Update profile / budgets

GET    /api/transactions             List (search, filter, paginate)
POST   /api/transactions             Create (auto-categorizes)
PATCH  /api/transactions/:id         Update (learns from corrections)
DELETE /api/transactions/:id         Delete

POST   /api/sms/parse                Parse single SMS with AI
POST   /api/sms/import               Save parsed transaction
POST   /api/sms/batch                Batch import (up to 100)

POST   /api/insights/generate        Full AI insights report
GET    /api/insights/subscriptions   Detected recurring charges
GET    /api/insights/predict         Spending predictions

GET    /api/analytics/dashboard      Summary stats
GET    /api/analytics/categories     Category breakdown
GET    /api/analytics/trend          N-month trend
GET    /api/analytics/weekly         Weekly chart data
GET    /api/analytics/report/:y/:m   Monthly report

GET    /api/budgets                  Get budgets + spending
PUT    /api/budgets                  Update limits

GET    /api/notifications            Get alerts
PATCH  /api/notifications/:id/read   Mark one read
PATCH  /api/notifications/read-all   Mark all read
POST   /api/notifications/check      Trigger alert checks

GET    /api/export/csv               Download CSV
GET    /api/export/json              Download JSON
POST   /api/export/import-json       Bulk import from JSON
```

---

## 🚢 Deploy to Production

### Backend → Railway / Render
```bash
# Set env vars in dashboard, then:
git push  # auto-deploys from GitHub
```

### Frontend → Vercel
```bash
vercel --prod
# Set VITE_API_URL to your deployed backend URL
```

### Database → MongoDB Atlas
- Free M0 tier works for MVP
- Whitelist `0.0.0.0/0` for Railway/Render IPs

---

## 📦 Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Zustand |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| AI | Anthropic Claude Sonnet (insights) + Haiku (SMS/categorize) |
| Auth | JWT (access + refresh tokens), Google OAuth |
| Deploy | Vercel (frontend), Railway (backend), MongoDB Atlas |
