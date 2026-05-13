'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import KpiCard from '@/components/shared/KpiCard'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import RegistroForm from '@/components/produccion/RegistroForm'
import RegistroTabla from '@/components/produccion/RegistroTabla'
import ProduccionChart from '@/components/produccion/ProduccionChart'
import { IRegistroProduccion } from '@/types'
import { Egg, TrendingUp, BarChart3, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react'

interface ChartPoint {
  fecha: string
  huevos: number
}

interface Stats {
  totalHoy: number
  promedioSemanal: number
  max30: number
  min30: number
  mortalidadAcumulada: number
  gallinasActivas: number
  porcentajePosicion: number
}

export default function ProduccionGalponPage() {
  const { id } = useParams<{ id: string }>()
  const [galponNombre, setGalponNombre] = useState('')
  const [registros, setRegistros] = useState<IRegistroProduccion[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const cargar = useCallback(async () => {
    try {
      const [galponRes, prodRes] = await Promise.all([
        fetch(`/api/galpones/${id}`),
        fetch(`/api/galpones/${id}/produccion?limit=15&page=${page}`),
      ])
      const [galponJson, prodJson] = await Promise.all([galponRes.json(), prodRes.json()])
      if (galponJson.success) setGalponNombre(galponJson.data.galpon.nombre)
      if (prodJson.success) {
        setRegistros(prodJson.data.registros)
        setStats(prodJson.data.stats)
        setChartData(prodJson.data.chartData)
        setTotalPages(prodJson.data.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }, [id, page])

  useEffect(() => {
    cargar()
  }, [cargar])

  if (loading) return <div className="p-6"><LoadingSpinner /></div>

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title={`Producción${galponNombre ? ` — ${galponNombre}` : ''}`}
        subtitle="Registros y estadísticas de producción de huevos"
        breadcrumbs={[
          { label: 'Galpones', href: '/galpones' },
          { label: galponNombre || id, href: `/galpones/${id}` },
          { label: 'Producción' },
        ]}
      />

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            title="Huevos hoy"
            value={(stats.totalHoy).toLocaleString()}
            icon={<Egg size={18} />}
            color="green"
          />
          <KpiCard
            title="Promedio diario (30d)"
            value={stats.promedioSemanal.toLocaleString()}
            subtitle="huevos/día"
            icon={<TrendingUp size={18} />}
            color="blue"
          />
          <KpiCard
            title="Máximo (30d)"
            value={stats.max30.toLocaleString()}
            icon={<BarChart3 size={18} />}
            color="green"
          />
          <KpiCard
            title="% Posición"
            value={`${stats.porcentajePosicion.toFixed(1)}%`}
            subtitle={`${stats.gallinasActivas} gallinas activas`}
            icon={<TrendingUp size={18} />}
            color={stats.porcentajePosicion >= 80 ? 'green' : stats.porcentajePosicion >= 60 ? 'amber' : 'red'}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Formulario rápido */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4">Registrar producción</h2>
            <RegistroForm galponId={id} onSuccess={cargar} />
          </div>
        </div>

        {/* Tabla + Gráfica */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfica */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <ProduccionChart data={chartData} title="Producción últimos 30 días" />
          </div>

          {/* Estadísticas adicionales */}
          {stats && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Mínimo (30d)</p>
                <p className="text-xl font-bold text-gray-900">{stats.min30}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Mortalidad acum.</p>
                <p className="text-xl font-bold text-red-600">{stats.mortalidadAcumulada}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Gallinas activas</p>
                <p className="text-xl font-bold text-green-700">{stats.gallinasActivas}</p>
              </div>
            </div>
          )}

          {/* Tabla de registros */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Historial de registros</h2>
            </div>
            <div className="p-5">
              <RegistroTabla registros={registros} />
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">Página {page} de {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    <ChevronRightIcon size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
