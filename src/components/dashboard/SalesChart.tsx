'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatARS } from '@/lib/calculations'

interface Props {
  roberTotal: number
  crisTotal: number
}

const COLORS = ['#7c3aed', '#10b981']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div
        style={{
          background: 'rgba(17,24,39,0.95)',
          border: '1px solid rgba(55,65,81,0.7)',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
        }}
      >
        <p style={{ color: payload[0].payload.color, fontWeight: 600, fontSize: '0.875rem' }}>
          {payload[0].name}
        </p>
        <p style={{ color: '#f9fafb', fontWeight: 700 }}>
          {formatARS(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

export default function SalesChart({ roberTotal, crisTotal }: Props) {
  const total = roberTotal + crisTotal

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
        Sin ventas registradas aún
      </div>
    )
  }

  const data = [
    { name: 'Rober', value: roberTotal, color: '#7c3aed' },
    { name: 'Cris', value: crisTotal, color: '#10b981' },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              opacity={0.9}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: '#d1d5db', fontSize: '0.75rem' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
