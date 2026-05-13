'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Wheat } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import AlimentoForm from '@/components/alimento/AlimentoForm'
import InventarioCard from '@/components/alimento/InventarioCard'
import InfoPanel from '@/components/shared/InfoPanel'
import { IGalpon, IRegistroAlimento } from '@/types'

type RegistroConGalpon = IRegistroAlimento & { galponNombre?: string }

interface InventarioInfo {
  inventarioKg: number
  consumoDiarioEstimado: number
}

export default function AlimentoPage() {
  const [galpones, setGalpones] = useState<IGalpon[]>([])
  const [registros, setRegistros] = useState<RegistroConGalpon[]>([])
  const [inventarioPorGalpon, setInventarioPorGalpon] = useState<Record<string, InventarioInfo>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/alimento?limit=20')
      const json = await res.json()
      if (json.success) {
        setGalpones(json.data.galpones)
        setInventarioPorGalpon(json.data.inventarioPorGalpon)

        const galponMap: Record<string, string> = {}
        json.data.galpones.forEach((g: IGalpon) => {
          galponMap[g._id.toString()] = g.nombre
        })

        const regsConNombre = json.data.registros.map((r: IRegistroAlimento & { galponId: { nombre?: string; _id?: string } | string }) => ({
          ...r,
          galponNombre:
            typeof r.galponId === 'object' && r.galponId !== null && 'nombre' in r.galponId
              ? r.galponId.nombre
              : galponMap[r.galponId?.toString() ?? ''] ?? '—',
        }))
        setRegistros(regsConNombre)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  function formatDate(d: Date | string) {
    return new Date(d).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Control de Alimento"
        subtitle="Inventario y suministro de alimento por galpón"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Alimento' }]}
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition shadow-sm"
          >
            <Plus size={16} />
            Registrar suministro
          </button>
        }
      />

      {/* Formulario expandible */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-green-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">Registrar suministro de alimento</h2>
          <AlimentoForm
            galpones={galpones}
            onSuccess={() => { setShowForm(false); cargar() }}
          />
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : galpones.length === 0 ? (
        <EmptyState
          icon={<Wheat size={28} />}
          title="No hay galpones registrados"
          description="Crea un galpón primero para poder registrar el alimento."
          action={{ label: 'Crear galpón', href: '/galpones/nuevo' }}
        />
      ) : (
        <>
          {/* Grid de inventario por galpón */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Inventario por galpón
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {galpones.map((g) => {
                const gId = g._id.toString()
                const info = inventarioPorGalpon[gId] ?? { inventarioKg: 0, consumoDiarioEstimado: 0 }
                return (
                  <InventarioCard
                    key={gId}
                    galpon={{ nombre: g.nombre, gallinas: g.cantidadGallinas }}
                    inventarioKg={info.inventarioKg}
                    consumoDiarioEstimado={info.consumoDiarioEstimado}
                    umbralDias={7}
                  />
                )
              })}
            </div>
          </div>

          {/* Registros recientes */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Suministros recientes
            </h2>
            {registros.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
                <p className="text-gray-400 text-sm">No hay registros de suministro aún.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Galpón</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Cantidad (kg)</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Costo total</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {registros.map((r, i) => (
                      <tr
                        key={r._id.toString()}
                        className={`hover:bg-green-50/20 transition-colors ${
                          i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDate(r.fecha)}</td>
                        <td className="px-4 py-3 text-gray-700">{r.galponNombre}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            {r.tipoAlimento}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{r.cantidadKg} kg</td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          ${r.costoTotal.toLocaleString('es-CO')}
                        </td>
                        <td className="px-4 py-3 text-right text-green-700 font-medium">
                          {r.inventarioRestante.toFixed(1)} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Info Panel */}
      <div className="mt-6">
        <InfoPanel
          title="Control de Alimento"
          description="Registra cada suministro de alimento por galpón para llevar un control preciso del inventario y el consumo diario estimado."
          userStory="Como productor, quiero controlar el inventario de alimento para recibir alertas antes de que se agote y evitar interrupciones en la producción."
          tip="Registra el suministro inmediatamente después de cada entrega para mantener el inventario actualizado y las alertas precisas."
        />
      </div>
    </div>
  )
}
