import { ReactNode } from 'react'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'stable'
  trendLabel?: string
  color?: 'green' | 'blue' | 'amber' | 'red' | 'purple'
}

const colorMap = {
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-700',
    value: 'text-green-700',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-700',
    value: 'text-blue-700',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-700',
    value: 'text-amber-700',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-700',
    value: 'text-red-700',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-700',
    value: 'text-purple-700',
  },
}

export default function KpiCard({
  title,
  value,
  subtitle,
  icon,
  color = 'green',
}: KpiCardProps) {
  const colors = colorMap[color]

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className={`mt-1.5 text-2xl font-bold ${colors.value} truncate`}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`ml-3 flex-shrink-0 w-10 h-10 rounded-lg ${colors.icon} flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
