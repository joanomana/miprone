'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Building2, Plus, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import ResumenGeneral from '@/components/dashboard/ResumenGeneral'
import GalponCard from '@/components/dashboard/GalponCard'
import GraficaProduccion from '@/components/dashboard/GraficaProduccion'
import AlertasBanner from '@/components/dashboard/AlertasBanner'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import { IGalpon, IAlerta } from '@/types'

interface GalponStats {
  huevosHoy: number
  porcentajePosicion: number
  mortalidadHoy: number
}

interface ChartPoint {
  fecha: string
  huevos: number
}

interface DashboardData {
  galpones: IGalpon[]
  galponStats: Record<string, GalponStats>
  alertas: IAlerta[]
  chartData: ChartPoint[]
  totales: {
    huevosHoy: number
    mortalidadHoy: number
    galponesActivos: number
    alertasPendientes: number
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  async function fetchDashboard() {
    setLoading(true)
    try {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const [galponesRes, produccionRes, alertasRes] = await Promise.all([
        fetch('/api/galpones'),
        fetch(`/api/produccion?desde=${sevenDaysAgo}&hasta=${todayStr}&limit=200`),
        fetch('/api/alertas?limit=20'),
      ])

      const [galponesData, produccionData, alertasData] = await Promise.all([
        galponesRes.json(),
        produccionRes.json(),
        alertasRes.json(),
      ])

      const galpones: IGalpon[] = galponesData.data ?? []
      const registros = produccionData.data?.registros ?? []
      const chartData: ChartPoint[] = produccionData.data?.chartData ?? []
      const alertas: IAlerta[] = alertasData.data ?? []

      // Compute per-galpón stats for today
      const galponStats: Record<string, GalponStats> = {}
      for (const g of galpones) {
        const gId = String(g._id)
        const registrosHoy = registros.filter((r: { galponId: string; fecha: string; cantidadHuevos: number; mortalidad: number }) => {
          const rDate = new Date(r.fecha).toISOString().split('T')[0]
          return String(r.galponId) === gId && rDate === todayStr
        })
        const huevosHoy = registrosHoy.reduce((sum: number, r: { cantidadHuevos: number }) => sum + r.cantidadHuevos, 0)
        const mortalidadHoy = registrosHoy.reduce((sum: number, r: { mortalidad: number }) => sum + r.mortalidad, 0)
        const porcentajePosicion = g.cantidadGallinas > 0 ? (huevosHoy / g.cantidadGallinas) * 100 : 0

        galponStats[gId] = { huevosHoy, mortalidadHoy, porcentajePosicion }
      }

      const totales = {
        huevosHoy: Object.values(galponStats).reduce((sum, s) => sum + s.huevosHoy, 0),
        mortalidadHoy: Object.values(galponStats).reduce((sum, s) => sum + s.mortalidadHoy, 0),
        galponesActivos: galpones.length,
        alertasPendientes: alertas.filter((a) => !a.leida).length,
      }

      setData({ galpones, galponStats, alertas, chartData, totales })
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching dashboard', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Productor'

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Buenos días, {firstName} 👋
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('es-CO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <p className="text-xs text-gray-400 hidden sm:block">
              Actualizado {lastUpdated.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:border-green-300 hover:text-green-700 transition-all disabled:opacity-50"
          >
            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      {loading ? (
        <LoadingSkeleton type="kpi" />
      ) : (
        <ResumenGeneral
          totalHuevosHoy={data?.totales.huevosHoy ?? 0}
          mortalidadHoy={data?.totales.mortalidadHoy ?? 0}
          galponesActivos={data?.totales.galponesActivos ?? 0}
          alertasPendientes={data?.totales.alertasPendientes ?? 0}
        />
      )}

      {/* Main grid: chart + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production chart — takes 2 cols */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Producción últimos 7 días</h3>
                <p className="text-sm text-gray-400 mt-0.5">Total de huevos recolectados por día</p>
              </div>
              <Link
                href="/produccion"
                className="text-xs font-medium text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                Ver registros
              </Link>
            </div>
            {loading ? (
              <div className="h-[250px] bg-gray-50 rounded-xl animate-pulse" />
            ) : (
              <GraficaProduccion data={data?.chartData ?? []} />
            )}
          </div>
        </div>

        {/* Alerts — 1 col */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Alertas activas</h3>
              {(data?.totales.alertasPendientes ?? 0) > 0 && (
                <span className="flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {data?.totales.alertasPendientes}
                </span>
              )}
            </div>
            {loading ? (
              <LoadingSkeleton type="table" />
            ) : (
              <AlertasBanner alertas={data?.alertas ?? []} />
            )}
          </div>
        </div>
      </div>

      {/* Galpones section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mis Galpones</h3>
            <p className="text-sm text-gray-400">
              {data?.galpones.length === 0
                ? 'Aún no tienes galpones registrados'
                : `${data?.galpones.length} galpón${(data?.galpones.length ?? 0) > 1 ? 'es' : ''} en producción`}
            </p>
          </div>
          <Link
            href="/galpones/nuevo"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
          >
            <Plus size={16} />
            Agregar galpón
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : data?.galpones.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
            <EmptyState
              icon={<Building2 size={32} />}
              title="Sin galpones registrados"
              description="Registra tu primer galpón para comenzar a llevar el control de producción, mortalidad y más."
              action={{ label: 'Agregar primer galpón', href: '/galpones/nuevo' }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.galpones.map((galpon) => (
              <GalponCard
                key={String(galpon._id)}
                galpon={galpon}
                stats={data.galponStats[String(galpon._id)] ?? {
                  huevosHoy: 0,
                  porcentajePosicion: 0,
                  mortalidadHoy: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
