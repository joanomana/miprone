'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import KpiCard from '@/components/shared/KpiCard'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import RegistroForm from '@/components/produccion/RegistroForm'
import RegistroTabla from '@/components/produccion/RegistroTabla'
import InfoPanel from '@/components/shared/InfoPanel'
import { IGalpon, IRegistroProduccion } from '@/types'
import { Egg, TrendingUp, BarChart3 } from 'lucide-react'

type RegistroConGalpon = IRegistroProduccion & { galponNombre?: string }

export default function ProduccionPage() {
  const [registros, setRegistros] = useState<RegistroConGalpon[]>([])
  const [galpones, setGalpones] = useState<IGalpon[]>([])
  const [galponFiltro, setGalponFiltro] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [kpis, setKpis] = useState({ totalHoy: 0, totalSemana: 0, promedioDiario: 0 })

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const galponesRes = await fetch('/api/galpones')
      const galponesJson = await galponesRes.json()
      const galponesData: IGalpon[] = galponesJson.success ? galponesJson.data : []
      setGalpones(galponesData)

      const galponIds = galponFiltro
        ? [galponFiltro]
        : galponesData.map((g) => g._id.toString())

      if (galponIds.length === 0) {
        setRegistros([])
        setLoading(false)
        return
      }

      // Fetch producción de cada galpón en paralelo
      const limit = 20
      const skip = (page - 1) * limit

      const responses = await Promise.all(
        galponIds.map((gId) =>
          fetch(`/api/galpones/${gId}/produccion?limit=50`).then((r) => r.json())
        )
      )

      const galponMap: Record<string, string> = {}
      galponesData.forEach((g) => { galponMap[g._id.toString()] = g.nombre })

      let todos: RegistroConGalpon[] = []
      let totalHoy = 0
      let totalSemana = 0

      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const hace7 = new Date(hoy)
      hace7.setDate(hace7.getDate() - 7)

      for (let i = 0; i < galponIds.length; i++) {
        const json = responses[i]
        if (json.success) {
          const regs: IRegistroProduccion[] = json.data.registros
          totalHoy += json.data.stats.totalHoy
          const semana = regs.filter((r) => new Date(r.fecha) >= hace7)
          totalSemana += semana.reduce((s, r) => s + r.cantidadHuevos, 0)
          const withNombre = regs.map((r) => ({
            ...r,
            galponNombre: galponMap[galponIds[i]] ?? '—',
          }))
          todos = todos.concat(withNombre)
        }
      }

      todos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

      setTotalPages(Math.ceil(todos.length / limit))
      setRegistros(todos.slice(skip, skip + limit))
      setKpis({
        totalHoy,
        totalSemana,
        promedioDiario: totalSemana > 0 ? Math.round(totalSemana / 7) : 0,
      })
    } finally {
      setLoading(false)
    }
  }, [galponFiltro, page])

  useEffect(() => {
    cargar()
  }, [cargar])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Registros de Producción"
        subtitle="Vista global de toda la producción de tu granja"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Producción' }]}
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition shadow-sm"
          >
            <Plus size={16} />
            Nuevo Registro
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard
          title="Total hoy"
          value={kpis.totalHoy.toLocaleString()}
          subtitle="huevos registrados hoy"
          icon={<Egg size={18} />}
          color="green"
        />
        <KpiCard
          title="Total semana"
          value={kpis.totalSemana.toLocaleString()}
          subtitle="últimos 7 días"
          icon={<BarChart3 size={18} />}
          color="blue"
        />
        <KpiCard
          title="Promedio diario"
          value={kpis.promedioDiario.toLocaleString()}
          subtitle="huevos/día (7d)"
          icon={<TrendingUp size={18} />}
          color="purple"
        />
      </div>

      {/* Formulario expandible */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-green-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">Registrar producción</h2>
          <RegistroForm
            galpones={galpones}
            onSuccess={() => { setShowForm(false); cargar() }}
          />
        </div>
      )}

      {/* Filtro por galpón */}
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-semibold text-gray-700">Filtrar por galpón:</label>
        <select
          value={galponFiltro}
          onChange={(e) => { setGalponFiltro(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        >
          <option value="">Todos los galpones</option>
          {galpones.map((g) => (
            <option key={g._id.toString()} value={g._id.toString()}>
              {g.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <RegistroTabla registros={registros} showGalpon />

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
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
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Links rápidos a galpones */}
      {galpones.length > 0 && (
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Ver producción por galpón
          </p>
          <div className="flex flex-wrap gap-2">
            {galpones.map((g) => (
              <Link
                key={g._id.toString()}
                href={`/galpones/${g._id.toString()}/produccion`}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition"
              >
                {g.nombre}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="mt-6">
        <InfoPanel
          title="Registro de Producción"
          description="Registra la cantidad de huevos recolectados por galpón y turno. Cada registro queda trazado con fecha, hora y responsable."
          userStory="Como productor, quiero registrar la producción diaria para llevar un historial preciso y detectar tendencias."
          tip="Registra en el mismo turno en que recogiste los huevos para mayor precisión."
        />
      </div>
    </div>
  )
}
