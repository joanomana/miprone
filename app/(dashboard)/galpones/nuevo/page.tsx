'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import GalponForm from '@/components/galpones/GalponForm'
import { GalponInput } from '@/lib/validations/galpon'

export default function NuevoGalponPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(data: GalponInput) {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/galpones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error ?? 'Error al crear el galpón')
      router.push('/galpones')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader
        title="Nuevo Galpón"
        subtitle="Registra un nuevo galpón en tu granja"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Galpones', href: '/galpones' },
          { label: 'Nuevo' },
        ]}
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <GalponForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  )
}
