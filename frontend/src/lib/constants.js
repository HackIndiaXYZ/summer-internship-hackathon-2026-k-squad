// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const CATEGORIES = {
  Food:          { color: '#FF6B6B', emoji: '🍔', defaultBudget: 5000 },
  Transport:     { color: '#4ECDC4', emoji: '🚗', defaultBudget: 3000 },
  Shopping:      { color: '#A78BFA', emoji: '🛍',  defaultBudget: 8000 },
  Bills:         { color: '#F59E0B', emoji: '📄', defaultBudget: 12000 },
  Entertainment: { color: '#EC4899', emoji: '🎬', defaultBudget: 2000 },
  Healthcare:    { color: '#34D399', emoji: '💊', defaultBudget: 3000 },
  Education:     { color: '#60A5FA', emoji: '📚', defaultBudget: 2000 },
  Other:         { color: '#94A3B8', emoji: '💰', defaultBudget: 2000 },
}

export const CATEGORY_NAMES = Object.keys(CATEGORIES)

// ─── NAV ──────────────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',      emoji: '🏠' },
  { id: 'transactions', label: 'Transactions',   emoji: '💳' },
  { id: 'sms',          label: 'SMS Import',     emoji: '📱' },
  { id: 'insights',     label: 'AI Insights',    emoji: '🧠', badge: 'AI' },
  { id: 'analytics',    label: 'Analytics',      emoji: '📊' },
  { id: 'budgets',      label: 'Budget Manager', emoji: '🎯' },
  { id: 'settings',     label: 'Settings',       emoji: '⚙️' },
]

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
export const MOCK_TRANSACTIONS = [
  { id: 1,  merchant: 'Swiggy',           amount: 450,   type: 'debit',  category: 'Food',          date: '2025-05-07', bank: 'HDFC',  acc: '****4521' },
  { id: 2,  merchant: 'Ola',              amount: 180,   type: 'debit',  category: 'Transport',     date: '2025-05-07', bank: 'SBI',   acc: '****7823' },
  { id: 3,  merchant: 'Flipkart',         amount: 2300,  type: 'debit',  category: 'Shopping',      date: '2025-05-06', bank: 'ICICI', acc: '****3311' },
  { id: 4,  merchant: 'HDFC Credit Card', amount: 8500,  type: 'debit',  category: 'Bills',         date: '2025-05-05', bank: 'HDFC',  acc: '****4521' },
  { id: 5,  merchant: 'BookMyShow',       amount: 600,   type: 'debit',  category: 'Entertainment', date: '2025-05-04', bank: 'ICICI', acc: '****3311' },
  { id: 6,  merchant: 'Apollo Pharmacy',  amount: 320,   type: 'debit',  category: 'Healthcare',    date: '2025-05-03', bank: 'SBI',   acc: '****7823' },
  { id: 7,  merchant: 'Salary Credit',    amount: 65000, type: 'credit', category: 'Other',         date: '2025-05-01', bank: 'HDFC',  acc: '****4521' },
  { id: 8,  merchant: 'Zomato',           amount: 280,   type: 'debit',  category: 'Food',          date: '2025-05-02', bank: 'HDFC',  acc: '****4521' },
  { id: 9,  merchant: 'Chennai Metro',    amount: 45,    type: 'debit',  category: 'Transport',     date: '2025-05-06', bank: 'SBI',   acc: '****7823' },
  { id: 10, merchant: 'Netflix',          amount: 649,   type: 'debit',  category: 'Entertainment', date: '2025-05-01', bank: 'ICICI', acc: '****3311' },
  { id: 11, merchant: 'Amazon',           amount: 1250,  type: 'debit',  category: 'Shopping',      date: '2025-05-03', bank: 'HDFC',  acc: '****4521' },
  { id: 12, merchant: 'EB Bill (TNEB)',   amount: 950,   type: 'debit',  category: 'Bills',         date: '2025-05-02', bank: 'SBI',   acc: '****7823' },
  { id: 13, merchant: 'Spotify',          amount: 119,   type: 'debit',  category: 'Entertainment', date: '2025-04-28', bank: 'ICICI', acc: '****3311' },
  { id: 14, merchant: 'MakeMyTrip',       amount: 4200,  type: 'debit',  category: 'Transport',     date: '2025-04-25', bank: 'HDFC',  acc: '****4521' },
  { id: 15, merchant: 'Decathlon',        amount: 1850,  type: 'debit',  category: 'Shopping',      date: '2025-04-22', bank: 'SBI',   acc: '****7823' },
  { id: 16, merchant: 'Dr Rajan Clinic',  amount: 500,   type: 'debit',  category: 'Healthcare',    date: '2025-04-20', bank: 'HDFC',  acc: '****4521' },
  { id: 17, merchant: 'Udemy Course',     amount: 899,   type: 'debit',  category: 'Education',     date: '2025-04-18', bank: 'ICICI', acc: '****3311' },
]

export const MOCK_NOTIFICATIONS = [
  { id: 1, sev: 'critical', title: 'Bills budget exceeded! 🚨',       msg: 'Spent ₹9,450 of your ₹8,000 Bills limit.', read: false },
  { id: 2, sev: 'warning',  title: 'Entertainment at 87% of budget',  msg: '₹1,368 of ₹2,000 used. 7 days remaining.', read: false },
  { id: 3, sev: 'info',     title: 'Netflix renews in 2 days',         msg: '₹649 auto-charge from ICICI ****3311.', read: false },
  { id: 4, sev: 'info',     title: 'Weekly spending report ready',     msg: '₹15,323 spent across 10 transactions.', read: true },
  { id: 5, sev: 'warning',  title: 'Unusual spend: MakeMyTrip',        msg: '₹4,200 is 3× your average. Verify this.', read: true },
]

export const TREND_DATA = [
  { month: 'Jan', spend: 32000, income: 65000 },
  { month: 'Feb', spend: 28500, income: 65000 },
  { month: 'Mar', spend: 41200, income: 65000 },
  { month: 'Apr', spend: 35800, income: 65000 },
  { month: 'May', spend: 15323, income: 65000 },
]

export const WEEKLY_DATA = [
  { day: 'Mon', amount: 1200 },
  { day: 'Tue', amount: 450 },
  { day: 'Wed', amount: 3200 },
  { day: 'Thu', amount: 680 },
  { day: 'Fri', amount: 2100 },
  { day: 'Sat', amount: 4500 },
  { day: 'Sun', amount: 900 },
]

export const SAMPLE_SMS = [
  "Dear Customer, Rs.450.00 debited from your HDFC Bank AC XX4521 on 07-May-25 to VPA swiggy@upi. Avl Bal:Rs.24,850.00",
  "Your SBI account XX7823 is debited by INR 180.00 on 07/05/2025 for UPI/OLA/OLACabs. Available Balance: INR 12,345.00",
  "Salary of Rs.65,000.00 has been credited to your HDFC Account XX4521 on 01-May-2025. Balance: Rs.85,000.00",
  "INR 8500.00 debited from ICICI Bank A/c XX3311 on 05-May-25 towards HDFC Credit Card. Avl Bal: INR 5,201.00",
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export const formatCurrency = (n) => `₹${Number(n).toLocaleString('en-IN')}`
export const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
export const formatDateShort = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
