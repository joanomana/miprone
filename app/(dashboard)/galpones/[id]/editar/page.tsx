'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import GalponForm from '@/components/galpones/GalponForm'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { IGalpon } from '@/types'
import { GalponInput } from '@/lib/validations/galpon'

export default function EditarGalponPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [galpon, setGalpon] = useState<IGalpon | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargar() {
      try {
        const res = await fetch(`/api/galpones/${id}`)
        const json = await res.json()
        if (!json.success) throw new Error(json.error)
        setGalpon(json.data.galpon)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error al cargar')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id])

  async function handleSubmit(data: GalponInput) {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/galpones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error ?? 'Error al actualizar')
      router.push(`/galpones/${id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
      setIsLoading(false)
    }
  }

  if (loading) return <div className="p-6"><LoadingSpinner /></div>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader
        title="Editar Galpón"
        subtitle={galpon?.nombre}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Galpones', href: '/galpones' },
          { label: galpon?.nombre ?? '...', href: `/galpones/${id}` },
          { label: 'Editar' },
        ]}
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {galpon ? (
          <GalponForm
            defaultValues={{
              nombre: galpon.nombre,
              cantidadGallinas: galpon.cantidadGallinas,
              semanasAproximadas: galpon.semanasAproximadas,
              raza: galpon.raza ?? '',
            }}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        ) : (
          <p className="text-gray-500 text-sm">No se encontró el galpón.</p>
        )}
      </div>
    </div>
  )
}
