import React from 'react'
import { CATEGORIES } from '../../lib/constants'

// ─── CATEGORY TAG ─────────────────────────────────────────────────────────────
export function Tag({ category }) {
  const cat = CATEGORIES[category] || CATEGORIES.Other
  return (
    <span
      className="tag"
      style={{ background: cat.color + '20', color: cat.color }}
    >
      {cat.emoji} {category}
    </span>
  )
}

// ─── SVG GAUGE ARC ────────────────────────────────────────────────────────────
export function GaugeArc({ pct = 0, size = 110 }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const offset = circ - circ * (Math.min(pct, 100) / 100)
  const color = pct >= 100 ? 'var(--red)' : pct >= 80 ? 'var(--amber)' : 'var(--acc)'
  return (
    <svg width={size} height={size} viewBox="0 0 110 110">
      <circle
        cx={55} cy={55} r={r}
        fill="none" stroke="var(--bdr)" strokeWidth={8}
        strokeDasharray={circ}
        transform="rotate(-90 55 55)"
      />
      <circle
        cx={55} cy={55} r={r}
        fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 55 55)"
        style={{ transition: 'stroke-dashoffset 1.1s ease, stroke .3s' }}
      />
    </svg>
  )
}

// ─── TOGGLE SWITCH ────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange }) {
  return (
    <label style={{ position: 'relative', width: 38, height: 22, flexShrink: 0, display: 'inline-block', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ opacity: 0, width: 0, height: 0 }}
      />
      <span style={{
        position: 'absolute', inset: 0,
        background: checked ? 'var(--acc)' : 'var(--bdr)',
        borderRadius: 999, transition: '.2s',
      }}>
        <span style={{
          position: 'absolute',
          height: 16, width: 16, left: 3, bottom: 3,
          background: '#fff', borderRadius: '50%',
          transition: '.2s',
          transform: checked ? 'translateX(16px)' : 'translateX(0)',
        }} />
      </span>
    </label>
  )
}

// ─── CHART TOOLTIP ────────────────────────────────────────────────────────────
export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg1)',
      border: '1px solid var(--bdr)',
      borderRadius: 9,
      padding: '8px 12px',
      fontSize: 12,
    }}>
      <div style={{ color: 'var(--txt2)', marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: ₹{Number(p.value).toLocaleString('en-IN')}
        </div>
      ))}
    </div>
  )
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
export function Skeleton({ height = 80, style = {} }) {
  return (
    <div
      className="animate-shimmer"
      style={{ borderRadius: 12, height, ...style }}
    />
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, subColor, emoji, onClick }) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{ padding: '15px 17px', cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
          {label}
        </span>
        <span style={{ fontSize: 18 }}>{emoji}</span>
      </div>
      <div
        className="mono"
        style={{ fontSize: 19, fontWeight: 700, marginBottom: 4 }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: subColor || 'var(--txt3)', fontWeight: 500 }}>{sub}</div>
    </div>
  )
}
