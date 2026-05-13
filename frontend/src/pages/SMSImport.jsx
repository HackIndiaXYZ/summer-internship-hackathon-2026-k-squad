import React, { useState } from 'react'
import { CATEGORY_NAMES, SAMPLE_SMS, formatCurrency } from '../lib/constants'
import { Tag } from '../components/ui'
import useTransactionStore from '../store/transactionStore'

export default function SMSImport() {
  const [sms, setSms]         = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')
  const [added, setAdded]     = useState(false)
  const [editCat, setEditCat] = useState('')

  const { addTransactionLocal } = useTransactionStore()

  const parse = async () => {
    if (!sms.trim()) return
    setLoading(true); setError(''); setResult(null); setAdded(false)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          system: `Expert Indian bank SMS transaction parser. Return ONLY valid JSON (no markdown):
{"merchant":"string","amount":number,"type":"debit|credit","bank":"string","account":"****XXXX","category":"Food|Transport|Shopping|Bills|Entertainment|Healthcare|Education|Other","description":"4-word description"}
If not a transaction SMS return: {"error":"Not a transaction SMS"}`,
          messages: [{ role: 'user', content: `Parse this SMS:\n${sms}` }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      if (parsed.error) throw new Error(parsed.error)
      setResult(parsed)
      setEditCat(parsed.category)
    } catch (e) {
      setError(e.message || 'Failed to parse SMS. Try a sample message first.')
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = () => {
    addTransactionLocal({ ...result, category: editCat })
    setAdded(true)
  }

  const clearAll = () => { setSms(''); setResult(null); setError(''); setAdded(false) }

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--acc-dim)', border: '1px solid var(--bdr-a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📱</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>SMS Import</h1>
            <p style={{ color: 'var(--txt2)', fontSize: 13 }}>AI automatically extracts transaction data from any bank SMS</p>
          </div>
        </div>
      </div>

      {/* Input card */}
      <div className="card animate-fadeUp" style={{ padding: 20, marginBottom: 12, animationDelay: '.07s' }}>
        <h3 style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 5 }}>Paste Bank SMS</h3>
        <p style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 12 }}>
          Supports HDFC, SBI, ICICI, Axis, Kotak and 12+ Indian banks
        </p>

        {/* Sample buttons */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--txt3)', alignSelf: 'center' }}>Quick samples:</span>
          {SAMPLE_SMS.map((s, i) => (
            <button key={i} className="btn-secondary" style={{ fontSize: 10.5, padding: '3px 9px' }}
              onClick={() => { setSms(s); setResult(null); setError(''); setAdded(false) }}>
              #{i + 1}
            </button>
          ))}
        </div>

        <textarea
          placeholder="Dear Customer, Rs.450.00 debited from HDFC Bank AC XX4521 on 07-May-25 to VPA swiggy@upi…"
          value={sms}
          onChange={(e) => setSms(e.target.value)}
          style={{ minHeight: 90, resize: 'vertical', lineHeight: 1.6, marginBottom: 10 }}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" onClick={parse} disabled={loading || !sms.trim()} style={{ flex: 1 }}>
            {loading ? <span className="animate-spin" style={{ display: 'inline-block' }}>⟳</span> : '✨'}
            {loading ? 'Parsing with AI…' : 'Parse with AI'}
          </button>
          {sms && (
            <button className="btn-secondary" onClick={clearAll}>✕ Clear</button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="animate-fadeUp" style={{ display: 'flex', gap: 9, padding: '11px 14px', borderRadius: 10, background: 'rgba(244,63,94,.08)', border: '1px solid rgba(244,63,94,.2)', marginBottom: 12 }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
          <p style={{ fontSize: 12, color: 'var(--red)' }}>{error}</p>
        </div>
      )}

      {/* Result */}
      {result && !error && (
        <div className="card animate-fadeUp" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>✅</span>
              <h3 style={{ fontWeight: 700, fontSize: 13.5 }}>Transaction Extracted</h3>
            </div>
            <Tag category={editCat} />
          </div>

          {/* Fields grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 13 }}>
            {[
              { label: 'Merchant',    value: result.merchant },
              { label: 'Amount',      value: formatCurrency(result.amount), mono: true },
              { label: 'Type',        value: result.type === 'credit' ? 'Credit ↑' : 'Debit ↓' },
              { label: 'Bank',        value: result.bank },
              { label: 'Account',     value: result.account || '—', mono: true },
              { label: 'Description', value: result.description },
            ].map((f, i) => (
              <div key={i} style={{ padding: '9px 12px', borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--bdr)' }}>
                <div style={{ fontSize: 10, color: 'var(--txt3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 3 }}>{f.label}</div>
                <div className={f.mono ? 'mono' : ''} style={{ fontSize: 12.5, fontWeight: 600 }}>{f.value}</div>
              </div>
            ))}
          </div>

          {/* Category override */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11, padding: '9px 12px', background: 'var(--bg2)', borderRadius: 9, border: '1px solid var(--bdr)' }}>
            <span style={{ fontSize: 11.5, color: 'var(--txt2)', fontWeight: 600, flexShrink: 0 }}>Category:</span>
            <select value={editCat} onChange={(e) => setEditCat(e.target.value)} style={{ flex: 1, padding: '6px 10px' }}>
              {CATEGORY_NAMES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {added ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', borderRadius: 9, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)' }}>
              ✅ <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>Transaction added to your history!</span>
            </div>
          ) : (
            <button className="btn-primary" style={{ width: '100%' }} onClick={addTransaction}>
              + Add to Transactions
            </button>
          )}
        </div>
      )}
    </div>
  )
}
