import React, { useState } from 'react'
import { CATEGORY_NAMES } from '../lib/constants'
import { GaugeArc, Skeleton } from '../components/ui'
import useTransactionStore from '../store/transactionStore'

const TYPE_STYLES = {
  alert:      { bg: 'rgba(244,63,94,.09)',  bd: 'rgba(244,63,94,.22)',  c: 'var(--red)',   e: '🚨' },
  warning:    { bg: 'rgba(245,158,11,.09)', bd: 'rgba(245,158,11,.22)', c: 'var(--amber)', e: '⚠️' },
  suggestion: { bg: 'rgba(0,229,180,.07)',  bd: 'rgba(0,229,180,.2)',   c: 'var(--acc)',   e: '💡' },
  info:       { bg: 'rgba(124,92,255,.09)', bd: 'rgba(124,92,255,.22)', c: 'var(--acc2)',  e: 'ℹ️' },
}

export default function Insights() {
  const { transactions } = useTransactionStore()
  const [loading, setLoading] = useState(false)
  const [items, setItems]     = useState(null)
  const [score, setScore]     = useState(null)
  const [error, setError]     = useState('')

  const generate = async () => {
    setLoading(true); setError(''); setItems(null)

    const summary = {
      totalSpend:  transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0),
      totalIncome: transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0),
      count: transactions.length,
      categories: Object.fromEntries(
        CATEGORY_NAMES.map((c) => [c, transactions.filter((t) => t.category === c && t.type === 'debit').reduce((s, t) => s + t.amount, 0)])
      ),
      topMerchants: [...new Set(transactions.slice(0, 8).map((t) => t.merchant))],
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1200,
          system: `You are a personal finance AI advisor for Indian users. Analyze spending data and provide actionable insights.
Return ONLY valid JSON (no markdown, no extra text):
{
  "insights": [
    {
      "type": "alert|warning|suggestion|info",
      "title": "max 6 words",
      "description": "2-3 specific actionable sentences with ₹ amounts",
      "ico": "relevant emoji"
    }
  ],
  "spendingScore": 0-100
}
Generate 6-7 highly personalized insights. Be specific to the actual ₹ amounts provided.`,
          messages: [{ role: 'user', content: `Analyze this Indian user's spending:\n${JSON.stringify(summary, null, 2)}` }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      setItems(parsed.insights || [])
      setScore(parsed.spendingScore)
    } catch (e) {
      setError('Failed to generate insights. Please check your Anthropic API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 780 }}>
      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--acc-dim)', border: '1px solid var(--bdr-a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧠</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>AI Insights</h1>
            <p style={{ color: 'var(--txt2)', fontSize: 13 }}>Powered by Claude Sonnet · Personalized spending analysis</p>
          </div>
        </div>
      </div>

      {/* CTA (initial state) */}
      {!items && !loading && (
        <div className="card animate-fadeUp" style={{ padding: '36px', textAlign: 'center', animationDelay: '.07s' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>✨</div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 7 }}>Unlock AI-Powered Insights</h2>
          <p style={{ color: 'var(--txt2)', fontSize: 13, marginBottom: 20, maxWidth: 340, margin: '0 auto 20px' }}>
            Claude AI will analyze your {transactions.length} transactions and surface personalized alerts, spending patterns, and savings opportunities.
          </p>
          <button className="btn-primary" style={{ display: 'inline-flex' }} onClick={generate}>
            ✨ Generate Insights
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} height={76} style={{ animationDelay: `${i * .1}s` }} />)}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px', borderRadius: 10, background: 'rgba(244,63,94,.08)', border: '1px solid rgba(244,63,94,.2)', marginBottom: 11 }}>
          <span>⚠️</span>
          <p style={{ fontSize: 12, color: 'var(--red)', flex: 1 }}>{error}</p>
          <button className="btn-secondary" onClick={generate}>↻ Retry</button>
        </div>
      )}

      {/* Results */}
      {items && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {/* Health score card */}
          {score != null && (
            <div className="card animate-fadeUp" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <GaugeArc pct={score} size={100} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="mono" style={{ fontSize: 18, fontWeight: 800, color: score >= 70 ? 'var(--green)' : score >= 45 ? 'var(--amber)' : 'var(--red)' }}>{score}</span>
                  <span style={{ fontSize: 9, color: 'var(--txt3)', fontWeight: 700 }}>/ 100</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10.5, color: 'var(--txt3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 5 }}>SPENDING HEALTH SCORE</div>
                <p style={{ fontSize: 12.5, color: 'var(--txt2)', lineHeight: 1.5 }}>
                  {score >= 70 ? 'Your finances are in great shape! Keep it up 🎉' : score >= 45 ? 'Some areas need attention — check the alerts below.' : 'Multiple risks detected. Act on the critical alerts.'}
                </p>
              </div>
              <button className="btn-secondary" onClick={generate} style={{ flexShrink: 0 }}>↻ Refresh</button>
            </div>
          )}

          {/* Insight cards */}
          {items.map((ins, i) => {
            const tc = TYPE_STYLES[ins.type] || TYPE_STYLES.info
            return (
              <div
                key={i}
                className="animate-fadeUp"
                style={{ padding: '13px 15px', borderRadius: 12, background: tc.bg, border: `1px solid ${tc.bd}`, display: 'flex', gap: 11, animationDelay: `${i * .07}s` }}
              >
                <div style={{ width: 33, height: 33, borderRadius: 9, flexShrink: 0, background: tc.bd, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
                  {ins.ico || tc.e}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{ins.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--txt2)', lineHeight: 1.55 }}>{ins.description}</div>
                </div>
                <span className="tag" style={{ background: tc.bd, color: tc.c, flexShrink: 0, alignSelf: 'flex-start', fontSize: 9 }}>
                  {ins.type}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
