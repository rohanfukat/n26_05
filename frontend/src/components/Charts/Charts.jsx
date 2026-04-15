import React from 'react'

// Small, dependency-free chart primitives (SVG) for static/dynamic-ready charts
export function BarChart({ data = [], width = 300, height = 140, padding = 8 }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const barWidth = (width - padding * 2) / data.length

  return (
    <svg width={width} height={height} className="block">
      {data.map((d, i) => {
        const h = (d.value / max) * (height - 30)
        const x = padding + i * barWidth + 6
        const y = height - h - 20
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth - 12} height={h} rx={4} fill={d.color || '#3b82f6'} />
            <text x={x + (barWidth - 12) / 2} y={height - 6} fontSize="10" textAnchor="middle" fill="#475569">{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

export function LineChart({ points = [], width = 300, height = 140, padding = 12, stroke = '#06b6d4' }) {
  if (!points.length) return null
  const max = Math.max(...points.map(p => p.value))
  const min = Math.min(...points.map(p => p.value))
  const range = max - min || 1
  const stepX = (width - padding * 2) / (points.length - 1 || 1)
  const coords = points.map((p, i) => {
    const x = padding + i * stepX
    const y = padding + (1 - (p.value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  return (
    <svg width={width} height={height} className="block">
      <polyline fill="none" stroke={stroke} strokeWidth="2" points={coords.join(' ')} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => {
        const [x, y] = coords[i].split(',').map(Number)
        return <circle key={i} cx={x} cy={y} r={3} fill={stroke} />
      })}
    </svg>
  )
}

export function PieChart({ data = [], size = 140 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const radius = size / 2
  let cumulative = 0

  const slices = data.map((d, i) => {
    const value = d.value
    const startAngle = (cumulative / total) * Math.PI * 2
    cumulative += value
    const endAngle = (cumulative / total) * Math.PI * 2
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
    const x1 = radius + radius * Math.sin(startAngle)
    const y1 = radius - radius * Math.cos(startAngle)
    const x2 = radius + radius * Math.sin(endAngle)
    const y2 = radius - radius * Math.cos(endAngle)
    const path = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
    return { path, color: d.color || '#60a5fa', label: d.label, value }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth="0.5" />
      ))}
    </svg>
  )
}

export function ChartCard({ title, children }) {
  return (
    <div className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
      <h4 className="text-sm font-semibold mb-3 text-slate-900 dark:text-slate-100">{title}</h4>
      <div>{children}</div>
    </div>
  )
}

export default {
  BarChart,
  PieChart,
  LineChart,
  ChartCard,
}
