import React, { useState } from 'react'
import { CATEGORIES, formatCurrency, formatDateShort } from '../../lib/constants'
import { Tag } from './index'

export default function TransactionRow({ tx, compact = false }) {
  const [hovered, setHovered] = useState(false)
  const cat = CATEGORIES[tx.category] || CATEGORIES.Other

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: compact ? '8px 10px' : '10px 12px',
        borderRadius: 10,
        transition: 'background .15s',
        background: hovered ? 'var(--card-h)' : 'transparent',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon */}
      <div style={{
        width: 37, height: 37, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: cat.color + '18',
        border: `1px solid ${cat.color}26`,
        fontSize: 15,
      }}>
        {cat.emoji}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tx.merchant}
        </div>
        <div style={{ fontSize: 11, color: 'var(--txt3)' }}>
          {tx.bank} · {tx.acc} · {formatDateShort(tx.date)}
        </div>
      </div>

      {/* Amount */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div
          className="mono"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: tx.type === 'credit' ? 'var(--green)' : 'var(--txt)',
            marginBottom: 3,
          }}
        >
          {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
        </div>
        <Tag category={tx.category} />
      </div>
    </div>
  )
}
