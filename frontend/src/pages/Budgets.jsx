import React, { useState } from 'react'
import { CATEGORIES, formatCurrency } from '../lib/constants'
import { GaugeArc } from '../components/ui'
import useTransactionStore from '../store/transactionStore'

export default function Budgets() {
  const { transactions } = useTransactionStore()
  const [monthly, setMonthly]   = useState(50000)
  const [editingM, setEditingM] = useState(false)
  const [budgets, setBudgets]   = useState(
    Object.fromEntries(Object.entries(CATEGORIES).map(([k, v]) => [k, v.defaultBudget]))
  )
  const [saved, setSaved] = useState(false)

  // This month's spend per category
  const debits = transactions.filter((t) => t.type === 'debit' && t.date?.startsWith('2025-05'))
  const spent  = Object.fromEntries(
    Object.keys(CATEGORIES).map((k) => [k, debits.filter((t) => t.category === k).reduce((s, t) => s + t.amount, 0)])
  )
  const totalSpent = Object.values(spent).reduce((s, v) => s + v, 0)
  const overallPct = Math.min(Math.round((totalSpent / monthly) * 100), 999)

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>Budget Manager</h1>
            <p style={{ color: 'var(--txt2)', fontSize: 13, marginTop: 2 }}>Set limits · track spending · stay on target</p>
          </div>
          <button className={saved ? 'btn-primary' : 'btn-secondary'} onClick={save}>
            {saved ? '✓ Saved!' : '💾 Save Budgets'}
          </button>
        </div>
      </div>

      {/* Overall budget */}
      <div className="card animate-fadeUp" style={{ padding: 20, marginBottom: 14, animationDelay: '.07s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {/* Gauge */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <GaugeArc pct={overallPct} size={112} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span className="mono" style={{ fontSize: 19, fontWeight: 800, color: overallPct >= 100 ? 'var(--red)' : overallPct >= 80 ? 'var(--amber)' : 'var(--acc)' }}>
                {overallPct}%
              </span>
              <span style={{ fontSize: 9.5, color: 'var(--txt3)', fontWeight: 700 }}>USED</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Monthly Budget</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
              {editingM ? (
                <input
                  type="number"
                  value={monthly}
                  onChange={(e) => setMonthly(Number(e.target.value))}
                  onBlur={() => setEditingM(false)}
                  autoFocus
                  style={{ width: 130, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 17, padding: '5px 9px' }}
                />
              ) : (
                <div className="mono" style={{ fontSize: 21, fontWeight: 800 }}>{formatCurrency(monthly)}</div>
              )}
              <button onClick={() => setEditingM(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 4 }}>✏️</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9 }}>
              {[
                { l: 'Spent',     v: formatCurrency(totalSpent),                c: overallPct >= 100 ? 'var(--red)' : 'var(--txt)' },
                { l: 'Remaining', v: formatCurrency(Math.max(0, monthly - totalSpent)), c: 'var(--green)' },
                { l: 'Days Left', v: '24',                                       c: 'var(--acc2)' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '9px 13px', background: 'var(--bg2)', borderRadius: 9, border: '1px solid var(--bdr)' }}>
                  <div style={{ fontSize: 10, color: 'var(--txt3)', fontWeight: 700, marginBottom: 3 }}>{s.l}</div>
                  <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: s.c }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category budgets */}
      <div className="card animate-fadeUp" style={{ padding: 18, animationDelay: '.14s' }}>
        <h3 style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 16 }}>Category Budgets</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {Object.entries(CATEGORIES).map(([cat, info]) => {
            const limit = budgets[cat] || 0
            const spnt  = spent[cat] || 0
            const pct   = limit > 0 ? Math.min(Math.round((spnt / limit) * 100), 100) : 0
            const over  = limit > 0 && spnt > limit
            const warn  = limit > 0 && pct >= 80 && !over
            const barColor = over ? 'var(--red)' : warn ? 'var(--amber)' : info.color

            return (
              <div key={cat} style={{
                padding: '13px 14px', borderRadius: 11,
                background: 'var(--bg2)',
                border: `1px solid ${over ? 'rgba(244,63,94,.3)' : warn ? 'rgba(245,158,11,.25)' : 'var(--bdr)'}`,
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{info.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: 12.5 }}>{cat}</span>
                  </div>
                  {over  && <span className="tag" style={{ background: 'rgba(244,63,94,.15)', color: 'var(--red)',   fontSize: 9 }}>OVER</span>}
                  {warn  && <span className="tag" style={{ background: 'rgba(245,158,11,.15)', color: 'var(--amber)', fontSize: 9 }}>WARN</span>}
                </div>

                {/* Progress bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'var(--bdr)' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: barColor, width: `${pct}%`, transition: 'width 1s ease' }} />
                  </div>
                  <span style={{ fontSize: 10.5, color: 'var(--txt3)', fontWeight: 600, flexShrink: 0 }}>{pct}%</span>
                </div>

                {/* Spent + Limit input */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--txt2)' }}>
                    Spent: <strong style={{ color: over ? 'var(--red)' : 'var(--txt)' }}>{formatCurrency(spnt)}</strong>
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 10.5, color: 'var(--txt3)' }}>Limit:</span>
                    <input
                      type="number"
                      value={limit}
                      onChange={(e) => setBudgets((p) => ({ ...p, [cat]: Number(e.target.value) }))}
                      style={{ width: 86, textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: 11.5, padding: '3px 7px', height: 26 }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
