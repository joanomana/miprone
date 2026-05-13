'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, Plus, Edit3, PowerOff, ChevronRight } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { IGalpon } from '@/types'

export default function GalponesPage() {
  const [galpones, setGalpones] = useState<IGalpon[]>([])
  const [loading, setLoading] = useState(true)

  async function cargarGalpones() {
    try {
      const res = await fetch('/api/galpones')
      const json = await res.json()
      if (json.success) setGalpones(json.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarGalpones()
  }, [])

  async function desactivarGalpon(id: string, nombre: string) {
    if (!confirm(`¿Desactivar el galpón "${nombre}"? Podrás reactivarlo después.`)) return
    const res = await fetch(`/api/galpones/${id}`, { method: 'DELETE' })
    if (res.ok) setGalpones((prev) => prev.filter((g) => g._id.toString() !== id))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Mis Galpones"
        subtitle="Gestiona todos los galpones de tu granja"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Galpones' }]}
        action={
          <Link
            href="/galpones/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition shadow-sm"
          >
            <Plus size={16} />
            Nuevo Galpón
          </Link>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : galpones.length === 0 ? (
        <EmptyState
          icon={<Building2 size={28} />}
          title="No tienes galpones registrados"
          description="Crea tu primer galpón para empezar a registrar producción y controlar el alimento."
          action={{ label: 'Crear primer galpón', href: '/galpones/nuevo' }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {galpones.map((g) => {
            const gId = g._id.toString()
            return (
              <div
                key={gId}
                className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* Card Header */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Building2 size={18} className="text-green-700" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{g.nombre}</h3>
                        {g.raza && <p className="text-xs text-gray-400">{g.raza}</p>}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        g.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {g.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Gallinas</p>
                      <p className="font-bold text-gray-900 text-lg">
                        {g.cantidadGallinas.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Semanas de vida</p>
                      <p className="font-bold text-gray-900 text-lg">{g.semanasAproximadas}</p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex gap-1">
                    <Link
                      href={`/galpones/${gId}/editar`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition"
                      title="Editar"
                    >
                      <Edit3 size={15} />
                    </Link>
                    <button
                      onClick={() => desactivarGalpon(gId, g.nombre)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Desactivar"
                    >
                      <PowerOff size={15} />
                    </button>
                  </div>
                  <Link
                    href={`/galpones/${gId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 transition"
                  >
                    Ver detalle
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
