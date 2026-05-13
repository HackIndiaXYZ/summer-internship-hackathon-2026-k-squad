import React, { useState, useMemo } from 'react'
import { CATEGORY_NAMES, formatCurrency, formatDateShort } from '../lib/constants'
import TransactionRow from '../components/ui/TransactionRow'
import useTransactionStore from '../store/transactionStore'

export default function Transactions() {
  const { transactions } = useTransactionStore()
  const [search,  setSearch]  = useState('')
  const [cat,     setCat]     = useState('All')
  const [type,    setType]    = useState('All')
  const [exported, setExported] = useState(false)

  const filtered = useMemo(() => transactions.filter((tx) => {
    const matchSearch = !search ||
      tx.merchant.toLowerCase().includes(search.toLowerCase()) ||
      tx.bank?.toLowerCase().includes(search.toLowerCase())
    return matchSearch && (cat === 'All' || tx.category === cat) && (type === 'All' || tx.type === type)
  }), [transactions, search, cat, type])

  const totDebit  = filtered.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
  const totCredit = filtered.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0)

  const exportCSV = () => {
    const rows = [
      ['Date', 'Merchant', 'Amount', 'Type', 'Category', 'Bank', 'Account'],
      ...filtered.map((t) => [formatDateShort(t.date), `"${t.merchant}"`, t.amount, t.type, t.category, t.bank, t.acc]),
    ]
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'tracky-transactions.csv'
    a.click()
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  return (
    <div style={{ maxWidth: 860 }}>
      <div className="animate-fadeUp" style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Transactions</h1>
        <p style={{ color: 'var(--txt2)', fontSize: 13, marginTop: 2 }}>{filtered.length} transactions</p>
      </div>

      {/* Filters */}
      <div className="animate-fadeUp" style={{ display: 'flex', gap: 8, marginBottom: 11, flexWrap: 'wrap', alignItems: 'center', animationDelay: '.07s' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 170 }}>
          <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt3)', fontSize: 11, pointerEvents: 'none' }}>🔍</span>
          <input placeholder="Search merchant, bank…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 28 }} />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} style={{ width: 'auto', minWidth: 130 }}>
          {['All', ...CATEGORY_NAMES].map((c) => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: 'auto', minWidth: 100 }}>
          <option value="All">All Types</option>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>
        <button className={exported ? 'btn-primary' : 'btn-secondary'} onClick={exportCSV} style={{ flexShrink: 0 }}>
          {exported ? '✓ Exported' : '⬇ Export CSV'}
        </button>
      </div>

      {/* Summary pills */}
      <div className="animate-fadeUp" style={{ display: 'flex', gap: 9, marginBottom: 11, flexWrap: 'wrap', animationDelay: '.14s' }}>
        {[
          { label: 'Debits',  value: totDebit,             color: 'var(--red)' },
          { label: 'Credits', value: totCredit,            color: 'var(--green)' },
          { label: 'Net',     value: totCredit - totDebit, color: (totCredit - totDebit) >= 0 ? 'var(--green)' : 'var(--red)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '7px 14px', display: 'flex', gap: 7, alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, color: 'var(--txt3)' }}>{s.label}</span>
            <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: s.color }}>{formatCurrency(Math.abs(s.value))}</span>
          </div>
        ))}
      </div>

      {/* Transaction list */}
      <div className="card animate-fadeUp" style={{ padding: 5, animationDelay: '.21s' }}>
        {filtered.length === 0
          ? <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt3)', fontSize: 13 }}>🔍 No transactions found</div>
          : filtered.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
        }
      </div>
    </div>
  )
}
