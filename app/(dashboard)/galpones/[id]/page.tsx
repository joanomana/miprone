'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import GalponDetalle from '@/components/galpones/GalponDetalle'
import KpiCard from '@/components/shared/KpiCard'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { IGalpon, IRegistroProduccion, IRegistroAlimento } from '@/types'
import { Building2, Egg, TrendingUp, TriangleAlert } from 'lucide-react'

interface StatsData {
  huevosHoy: number
  mortalidadAcumulada: number
  gallinasActivas: number
  porcentajePosicion: number
}

export default function GalponDetallePage() {
  const { id } = useParams<{ id: string }>()
  const [galpon, setGalpon] = useState<IGalpon | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [produccionRegistros, setProduccionRegistros] = useState<IRegistroProduccion[]>([])
  const [alimentoRegistros, setAlimentoRegistros] = useState<IRegistroAlimento[]>([])
  const [inventarioActual, setInventarioActual] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargar() {
      try {
        const [galponRes, prodRes, aliRes] = await Promise.all([
          fetch(`/api/galpones/${id}`),
          fetch(`/api/galpones/${id}/produccion?limit=10`),
          fetch(`/api/galpones/${id}/alimento?limit=10`),
        ])

        const [galponJson, prodJson, aliJson] = await Promise.all([
          galponRes.json(),
          prodRes.json(),
          aliRes.json(),
        ])

        if (!galponJson.success) throw new Error(galponJson.error)

        setGalpon(galponJson.data.galpon)
        setStats(galponJson.data.stats)
        if (prodJson.success) setProduccionRegistros(prodJson.data.registros)
        if (aliJson.success) {
          setAlimentoRegistros(aliJson.data.registros)
          setInventarioActual(aliJson.data.inventarioActual ?? 0)
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error al cargar')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id])

  if (loading) return <div className="p-6"><LoadingSpinner /></div>
  if (error || !galpon) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-red-700 font-medium">{error || 'Galpón no encontrado'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title={galpon.nombre}
        subtitle={galpon.raza ? `Raza: ${galpon.raza}` : undefined}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Galpones', href: '/galpones' },
          { label: galpon.nombre },
        ]}
        action={
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
              galpon.activo
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {galpon.activo ? 'Activo' : 'Inactivo'}
          </span>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Gallinas activas"
          value={(stats?.gallinasActivas ?? galpon.cantidadGallinas).toLocaleString()}
          subtitle={`de ${galpon.cantidadGallinas.toLocaleString()} totales`}
          icon={<Building2 size={18} />}
          color="green"
        />
        <KpiCard
          title="Huevos hoy"
          value={(stats?.huevosHoy ?? 0).toLocaleString()}
          subtitle="producción del día"
          icon={<Egg size={18} />}
          color="blue"
        />
        <KpiCard
          title="% Posición"
          value={`${(stats?.porcentajePosicion ?? 0).toFixed(1)}%`}
          subtitle="huevos/gallina activa"
          icon={<TrendingUp size={18} />}
          color={
            (stats?.porcentajePosicion ?? 0) >= 80
              ? 'green'
              : (stats?.porcentajePosicion ?? 0) >= 60
              ? 'amber'
              : 'red'
          }
        />
        <KpiCard
          title="Mortalidad acumulada"
          value={(stats?.mortalidadAcumulada ?? 0).toLocaleString()}
          subtitle={`${(((stats?.mortalidadAcumulada ?? 0) / galpon.cantidadGallinas) * 100).toFixed(2)}% del total`}
          icon={<TriangleAlert size={18} />}
          color={(stats?.mortalidadAcumulada ?? 0) / galpon.cantidadGallinas > 0.05 ? 'red' : 'amber'}
        />
      </div>

      {/* Detalle con tabs */}
      <GalponDetalle
        galpon={galpon}
        produccionData={{
          registros: produccionRegistros,
          stats: {
            huevosHoy: stats?.huevosHoy ?? 0,
            porcentajePosicion: stats?.porcentajePosicion ?? 0,
            mortalidadAcumulada: stats?.mortalidadAcumulada ?? 0,
          },
        }}
        alimentoData={{
          registros: alimentoRegistros,
          inventarioActual,
        }}
      />
    </div>
  )
}
