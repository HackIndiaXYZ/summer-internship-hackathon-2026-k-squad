import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { CATEGORIES, formatCurrency, TREND_DATA } from '../lib/constants'
import { StatCard, ChartTooltip } from '../components/ui'
import TransactionRow from '../components/ui/TransactionRow'
import useTransactionStore from '../store/transactionStore'

export default function Dashboard({ setPage }) {
  const { transactions } = useTransactionStore()

  const thisMonth = transactions.filter((t) => t.date?.startsWith('2025-05'))
  const spend  = thisMonth.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
  const income = thisMonth.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0)

  const catPie = Object.entries(CATEGORIES)
    .map(([name, info]) => ({
      name,
      value: transactions.filter((t) => t.category === name && t.type === 'debit').reduce((s, t) => s + t.amount, 0),
      color: info.color,
      emoji: info.emoji,
    }))
    .filter((c) => c.value > 0)

  return (
    <div style={{ maxWidth: 1060 }}>
      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.5px' }}>Good morning! 👋</h1>
        <p style={{ color: 'var(--txt2)', fontSize: 13, marginTop: 3 }}>Your financial snapshot for May 2025</p>
      </div>

      {/* Stats */}
      <div
        className="animate-fadeUp"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 11, marginBottom: 14, animationDelay: '.07s' }}
      >
        <StatCard label="Monthly Spend"  value={formatCurrency(spend)}  sub="-12.4% vs Apr" subColor="var(--red)"   emoji="💸" />
        <StatCard label="Total Income"   value={formatCurrency(income)} sub="Salary credited" subColor="var(--green)" emoji="💰" />
        <StatCard label="Net Savings"    value={formatCurrency(Math.max(0, income - spend))} sub={(income - spend) > 0 ? 'On track 🎯' : 'Overspent'} subColor={(income - spend) > 0 ? 'var(--green)' : 'var(--red)'} emoji="🏦" />
        <StatCard label="Transactions"   value={thisMonth.length} sub={`${transactions.length} all time`} subColor="var(--acc2)" emoji="📋" onClick={() => setPage('transactions')} />
      </div>

      {/* Charts row */}
      <div
        className="animate-fadeUp"
        style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12, marginBottom: 14, animationDelay: '.14s' }}
      >
        {/* Area chart */}
        <div className="card" style={{ padding: 17 }}>
          <h3 style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 2 }}>Spending vs Income</h3>
          <p style={{ color: 'var(--txt3)', fontSize: 11, marginBottom: 14 }}>Jan–May 2025</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={TREND_DATA} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5B4" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#00E5B4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bdr)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--txt3)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis stroke="var(--txt3)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income" name="Income"   stroke="#00E5B4" strokeWidth={2} fill="url(#gA)" />
              <Area type="monotone" dataKey="spend"  name="Spending" stroke="#F43F5E" strokeWidth={2} fill="url(#gB)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card" style={{ padding: 17 }}>
          <h3 style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 14 }}>By Category</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={catPie} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value">
                {catPie.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
            {catPie.slice(0, 4).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: c.color }} />
                  <span style={{ color: 'var(--txt2)' }}>{c.emoji} {c.name}</span>
                </div>
                <span className="mono" style={{ fontWeight: 600, fontSize: 11 }}>{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card animate-fadeUp" style={{ padding: 15, animationDelay: '.21s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11, paddingBottom: 10, borderBottom: '1px solid var(--bdr)' }}>
          <h3 style={{ fontWeight: 700, fontSize: 13.5 }}>Recent Transactions</h3>
          <button className="btn-secondary" style={{ fontSize: 11 }} onClick={() => setPage('transactions')}>View All →</button>
        </div>
        {transactions.slice(0, 6).map((tx) => <TransactionRow key={tx.id} tx={tx} />)}
      </div>
    </div>
  )
}
