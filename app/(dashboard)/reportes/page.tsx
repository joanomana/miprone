'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Egg,
  Skull,
  Wheat,
  DollarSign,
  Info,
  RefreshCw,
} from 'lucide-react'

type Periodo = '7d' | '30d' | '90d' | 'custom'

interface ReportData {
  produccion: {
    total: number
    promedioDiario: number
    mejorDia: { fecha: string; huevos: number }
    peorDia: { fecha: string; huevos: number }
    porDia: { fecha: string; huevos: number }[]
  }
  mortalidad: {
    total: number
    porcentaje: number
    porDia: { fecha: string; mortalidad: number; acumulada: number }[]
  }
  alimento: {
    totalKg: number
    totalCosto: number
    costoPorHuevo: number
    porSemana: { semana: string; kg: number; costo: number }[]
  }
  rentabilidad: {
    ingresosEstimados: number
    costosTotales: number
    ganancia: number
    porMes: { mes: string; ingresos: number; costos: number; ganancia: number }[]
  }
}

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

export default function ReportesPage() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [desdeCustom, setDesdeCustom] = useState('')
  const [hastaCustom, setHastaCustom] = useState('')
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      let desde: Date, hasta: Date
      hasta = new Date()
      if (periodo === '7d') {
        desde = new Date(Date.now() - 7 * 86400000)
      } else if (periodo === '30d') {
        desde = new Date(Date.now() - 30 * 86400000)
      } else if (periodo === '90d') {
        desde = new Date(Date.now() - 90 * 86400000)
      } else {
        desde = desdeCustom ? new Date(desdeCustom) : new Date(Date.now() - 30 * 86400000)
        hasta = hastaCustom ? new Date(hastaCustom) : new Date()
      }

      const params = new URLSearchParams({
        desde: desde.toISOString(),
        hasta: hasta.toISOString(),
      })
      const res = await fetch(`/api/reportes?${params}`)
      if (!res.ok) throw new Error('Error al obtener reportes')
      const json = await res.json()
      setData(json.data)
    } catch {
      setError('No se pudieron cargar los reportes.')
    } finally {
      setLoading(false)
    }
  }, [periodo, desdeCustom, hastaCustom])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const periodos: { id: Periodo; label: string }[] = [
    { id: '7d', label: 'Esta semana' },
    { id: '30d', label: 'Este mes' },
    { id: '90d', label: 'Últimos 3 meses' },
    { id: 'custom', label: 'Personalizado' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-green-600 shadow-lg shadow-green-200">
              <BarChart3 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
              <p className="text-sm text-gray-500">Indicadores de rendimiento de tu producción</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {/* Filtros de período */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Período:</span>
            <div className="flex flex-wrap gap-2">
              {periodos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriodo(p.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    periodo === p.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {periodo === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={desdeCustom}
                  onChange={(e) => setDesdeCustom(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="date"
                  value={hastaCustom}
                  onChange={(e) => setHastaCustom(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-red-700 text-sm">{error}</div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={32} className="text-green-500 animate-spin" />
              <p className="text-gray-500 text-sm">Calculando datos...</p>
            </div>
          </div>
        )}

        {!loading && data && (
          <div className="space-y-8">
            {/* SECCIÓN 1: Producción */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                <Egg size={18} className="text-green-600" />
                <h2 className="text-base font-semibold text-gray-900">Producción de Huevos</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KpiCard
                    title="Total huevos"
                    value={data.produccion.total.toLocaleString('es-CO')}
                    subtitle="en el período"
                    icon={Egg}
                    color="bg-green-500"
                  />
                  <KpiCard
                    title="Promedio diario"
                    value={data.produccion.promedioDiario.toLocaleString('es-CO')}
                    subtitle="huevos/día"
                    icon={TrendingUp}
                    color="bg-blue-500"
                  />
                  <KpiCard
                    title="Mejor día"
                    value={data.produccion.mejorDia.huevos.toLocaleString('es-CO')}
                    subtitle={data.produccion.mejorDia.fecha || '—'}
                    icon={TrendingUp}
                    color="bg-emerald-500"
                  />
                  <KpiCard
                    title="Peor día"
                    value={
                      data.produccion.peorDia.huevos === 0
                        ? '—'
                        : data.produccion.peorDia.huevos.toLocaleString('es-CO')
                    }
                    subtitle={data.produccion.peorDia.fecha || '—'}
                    icon={TrendingDown}
                    color="bg-red-400"
                  />
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data.produccion.porDia} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="gradProd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                      formatter={(v) => [Number(v).toLocaleString('es-CO'), 'Huevos']}
                    />
                    <Area
                      type="monotone"
                      dataKey="huevos"
                      stroke="#16a34a"
                      strokeWidth={2}
                      fill="url(#gradProd)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* SECCIÓN 2: Mortalidad */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                <Skull size={18} className="text-red-500" />
                <h2 className="text-base font-semibold text-gray-900">Mortalidad</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <KpiCard
                    title="Total mortalidad"
                    value={`${data.mortalidad.total} aves`}
                    subtitle="en el período"
                    icon={Skull}
                    color="bg-red-500"
                  />
                  <KpiCard
                    title="% sobre población"
                    value={`${data.mortalidad.porcentaje.toFixed(2)}%`}
                    subtitle="del total inicial"
                    icon={TrendingDown}
                    color="bg-orange-500"
                  />
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.mortalidad.porDia} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="mortalidad"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                      name="Diaria"
                    />
                    <Line
                      type="monotone"
                      dataKey="acumulada"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="4 2"
                      name="Acumulada"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* SECCIÓN 3: Alimento y Costos */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                <Wheat size={18} className="text-amber-600" />
                <h2 className="text-base font-semibold text-gray-900">Alimento y Costos</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <KpiCard
                    title="Total alimento"
                    value={`${data.alimento.totalKg.toLocaleString('es-CO')} kg`}
                    subtitle="consumido"
                    icon={Wheat}
                    color="bg-amber-500"
                  />
                  <KpiCard
                    title="Costo alimento"
                    value={formatCOP(data.alimento.totalCosto)}
                    subtitle="total período"
                    icon={DollarSign}
                    color="bg-orange-500"
                  />
                  <KpiCard
                    title="Costo / huevo"
                    value={formatCOP(data.alimento.costoPorHuevo)}
                    subtitle="KPI de eficiencia"
                    icon={Egg}
                    color="bg-purple-500"
                  />
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.alimento.porSemana} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="semana" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                      formatter={(v, name) =>
                        name === 'costo' ? [formatCOP(Number(v)), 'Costo'] : [`${Number(v).toLocaleString('es-CO')} kg`, 'Alimento']
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar yAxisId="left" dataKey="kg" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Kg alimento" />
                    <Bar yAxisId="right" dataKey="costo" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Costo ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* SECCIÓN 4: Rentabilidad */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                <DollarSign size={18} className="text-green-600" />
                <h2 className="text-base font-semibold text-gray-900">Rentabilidad Estimada</h2>
                <span className="ml-auto text-xs text-gray-400">Precio referencia: $420 COP/huevo</span>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <KpiCard
                    title="Ingresos estimados"
                    value={formatCOP(data.rentabilidad.ingresosEstimados)}
                    subtitle="huevos × $420"
                    icon={TrendingUp}
                    color="bg-green-500"
                  />
                  <KpiCard
                    title="Costos totales"
                    value={formatCOP(data.rentabilidad.costosTotales)}
                    subtitle="registrados"
                    icon={DollarSign}
                    color="bg-red-400"
                  />
                  <KpiCard
                    title="Ganancia estimada"
                    value={formatCOP(data.rentabilidad.ganancia)}
                    subtitle={data.rentabilidad.ganancia >= 0 ? 'rentable' : 'en déficit'}
                    icon={data.rentabilidad.ganancia >= 0 ? TrendingUp : TrendingDown}
                    color={data.rentabilidad.ganancia >= 0 ? 'bg-emerald-500' : 'bg-red-500'}
                  />
                </div>
                {data.rentabilidad.porMes.length > 0 && (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={data.rentabilidad.porMes} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                        formatter={(v, name) => [formatCOP(Number(v)), String(name)]}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="ingresos" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4 }} name="Ingresos" />
                      <Line type="monotone" dataKey="costos" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="Costos" />
                      <Line type="monotone" dataKey="ganancia" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" name="Ganancia" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            {/* InfoPanel */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-start gap-3">
                <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 space-y-1">
                  <p className="font-semibold mb-2">Acerca de los indicadores</p>
                  <p><strong>Costo/huevo:</strong> Costo total de alimento dividido entre huevos producidos. KPI clave de eficiencia productiva.</p>
                  <p><strong>Ingresos estimados:</strong> Calculados usando el precio de referencia de mercado ($420 COP/huevo). El precio real puede variar.</p>
                  <p><strong>Rentabilidad:</strong> Diferencia entre ingresos estimados y costos registrados. Solo incluye costos que hayas ingresado al sistema.</p>
                  <p><strong>Mortalidad:</strong> Una mortalidad mensual mayor al 2–3% requiere revisión veterinaria.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !data && !error && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
            <BarChart3 size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500">Selecciona un período para ver los reportes</p>
          </div>
        )}
      </div>
    </div>
  )
}
