import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CATEGORIES, formatCurrency, TREND_DATA, WEEKLY_DATA } from '../lib/constants'
import { ChartTooltip } from '../components/ui'
import useTransactionStore from '../store/transactionStore'

export default function Analytics() {
  const { transactions } = useTransactionStore()

  const catData = Object.entries(CATEGORIES)
    .map(([name, info]) => {
      const total = transactions.filter((t) => t.category === name && t.type === 'debit').reduce((s, t) => s + t.amount, 0)
      return { name, total, color: info.color, emoji: info.emoji }
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)

  const grandTotal = catData.reduce((s, c) => s + c.total, 0)
  const maxVal = Math.max(...catData.map((c) => c.total))

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="animate-fadeUp" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Analytics</h1>
        <p style={{ color: 'var(--txt2)', fontSize: 13, marginTop: 2 }}>Detailed breakdown of spending patterns</p>
      </div>

      {/* Weekly bar chart */}
      <div className="card animate-fadeUp" style={{ padding: 17, marginBottom: 13, animationDelay: '.07s' }}>
        <h3 style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 1 }}>Weekly Spending</h3>
        <p style={{ color: 'var(--txt3)', fontSize: 11, marginBottom: 14 }}>May 1–7, 2025 · Saturday was peak day</p>
        <ResponsiveContainer width="100%" height={165}>
          <BarChart data={WEEKLY_DATA} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--bdr)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--txt3)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis stroke="var(--txt3)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="amount" name="Spending" radius={[5, 5, 0, 0]}>
              {WEEKLY_DATA.map((_, i) => (
                <Cell key={i} fill={i === 5 ? 'var(--acc)' : 'var(--acc2)'} fillOpacity={i === 5 ? 1 : 0.5} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two columns */}
      <div className="animate-fadeUp" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, animationDelay: '.14s' }}>
        {/* Category breakdown */}
        <div className="card" style={{ padding: 17 }}>
          <h3 style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 14 }}>Spend by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {catData.map((c, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13 }}>{c.emoji}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{c.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 10.5, color: 'var(--txt3)', fontWeight: 600 }}>{Math.round(c.total / grandTotal * 100)}%</span>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{formatCurrency(c.total)}</span>
                  </div>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: 'var(--bdr)' }}>
                  <div style={{ height: '100%', borderRadius: 999, background: c.color, width: `${c.total / maxVal * 100}%`, transition: 'width 1.1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly comparison */}
        <div className="card" style={{ padding: 17 }}>
          <h3 style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 2 }}>Monthly Comparison</h3>
          <p style={{ color: 'var(--txt3)', fontSize: 11, marginBottom: 13 }}>Income vs Spending · Jan–May 2025</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={TREND_DATA} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barGap={3} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bdr)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--txt3)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis stroke="var(--txt3)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="income" name="Income"   fill="var(--acc)" opacity={0.65} radius={[4, 4, 0, 0]} />
              <Bar dataKey="spend"  name="Spending" fill="#F43F5E"    opacity={0.72} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 9, justifyContent: 'center' }}>
            {[{ c: 'var(--acc)', l: 'Income' }, { c: '#F43F5E', l: 'Spending' }].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--txt2)' }}>
                <div style={{ width: 9, height: 9, borderRadius: 2, background: l.c }} />
                {l.l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
