interface LoadingSkeletonProps {
  type: 'card' | 'table' | 'chart' | 'kpi'
  count?: number
}

function KpiSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-gray-100" />
        <div className="w-16 h-5 rounded-full bg-gray-100" />
      </div>
      <div className="w-24 h-8 rounded-lg bg-gray-200 mb-2" />
      <div className="w-32 h-4 rounded bg-gray-100" />
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-1.5 w-full bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-32 h-6 rounded-lg bg-gray-200" />
          <div className="w-16 h-6 rounded-full bg-gray-100" />
        </div>
        <div className="w-24 h-4 rounded bg-gray-100" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-1.5">
              <div className="w-14 h-3 rounded bg-gray-200" />
              <div className="w-10 h-5 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="w-40 h-5 rounded-lg bg-gray-200" />
          <div className="w-56 h-4 rounded bg-gray-100" />
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-16 h-8 rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
      <div className="h-[220px] flex items-end gap-2 px-2">
        {[65, 45, 80, 55, 90, 70, 85].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-100 rounded-t-lg"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="p-5 border-b border-gray-100">
        <div className="w-40 h-5 rounded-lg bg-gray-200" />
      </div>
      <div className="divide-y divide-gray-100">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="w-32 h-4 rounded bg-gray-200" />
              <div className="w-20 h-3 rounded bg-gray-100" />
            </div>
            <div className="w-20 h-6 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LoadingSkeleton({ type, count = 1 }: LoadingSkeletonProps) {
  if (type === 'kpi') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <KpiSkeleton key={i} />)}
      </div>
    )
  }

  if (type === 'chart') return <ChartSkeleton />
  if (type === 'table') return <TableSkeleton />

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => <CardSkeleton key={i} />)}
    </div>
  )
}
