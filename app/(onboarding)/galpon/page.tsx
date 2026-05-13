'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import StepIndicator from '@/components/onboarding/StepIndicator'
import { galponSchema, GalponInput } from '@/lib/validations/galpon'

interface GalponLocal {
  nombre: string
  cantidadGallinas: number
  semanasAproximadas: number
  raza?: string
}

export default function GalponPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [galpones, setGalpones] = useState<GalponLocal[]>([])
  const [isFinalizing, setIsFinalizing] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<GalponInput>({
    resolver: zodResolver(galponSchema),
    defaultValues: {
      nombre: '',
      cantidadGallinas: undefined,
      semanasAproximadas: 20,
      raza: '',
    },
  })

  const semanasValue = watch('semanasAproximadas')

  function onAddGalpon(data: GalponInput) {
    const newGalpon: GalponLocal = {
      nombre: data.nombre,
      cantidadGallinas: data.cantidadGallinas,
      semanasAproximadas: data.semanasAproximadas,
      raza: data.raza || undefined,
    }
    setGalpones((prev) => [...prev, newGalpon])
    reset({ nombre: '', cantidadGallinas: undefined, semanasAproximadas: 20, raza: '' })
    toast.success(`Galpón "${data.nombre}" agregado`)
  }

  function removeGalpon(index: number) {
    setGalpones((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleFinalize() {
    if (galpones.length === 0) {
      toast.error('Agrega al menos un galpón antes de continuar.')
      return
    }

    setIsFinalizing(true)

    try {
      // Create each galpon
      for (const galpon of galpones) {
        const res = await fetch('/api/galpones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(galpon),
        })

        const json = await res.json()

        if (!res.ok || !json.success) {
          toast.error(`Error al guardar el galpón "${galpon.nombre}": ${json.error ?? 'Error desconocido'}`)
          setIsFinalizing(false)
          return
        }
      }

      // Mark onboarding as complete
      if (session?.user?.id) {
        const res = await fetch(`/api/usuarios/${session.user.id}/complete-onboarding`, {
          method: 'POST',
        })
        const json = await res.json()
        if (!res.ok || !json.success) {
          console.warn('Could not mark onboarding complete:', json.error)
        }
      }

      toast.success('¡Todo listo! Bienvenido a MiProne 🎉')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Error de red. Verifica tu conexión e intenta de nuevo.')
      setIsFinalizing(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full h-11 px-3.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors
    ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`

  return (
    <>
      <StepIndicator currentStep={2} />

      <div className="bg-white rounded-2xl shadow-xl shadow-green-100/50 border border-gray-100 p-8">
        {/* Header */}
        <div className="mb-7">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-green-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Configura tu primer galpón</h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Puedes agregar todos los galpones que necesites. Siempre podrás añadir más desde el dashboard.
          </p>
        </div>

        {/* Galpones list */}
        {galpones.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {galpones.length}
              </span>
              Galpones agregados
            </h3>
            <div className="space-y-2">
              {galpones.map((g, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-green-800">{g.nombre}</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      {g.cantidadGallinas.toLocaleString()} gallinas
                      {' · '}
                      {g.semanasAproximadas} semanas
                      {g.raza ? ` · ${g.raza}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGalpon(i)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
                    title="Eliminar galpón"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-5 mb-5" />
          </div>
        )}

        {/* Form: add galpon */}
        <form onSubmit={handleSubmit(onAddGalpon)} className="space-y-4" noValidate>
          <h3 className="text-sm font-semibold text-gray-700">
            {galpones.length === 0 ? 'Datos del galpón' : 'Agregar otro galpón'}
          </h3>

          {/* Nombre galpón */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre del galpón <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              placeholder="Ej: Galpón A, Galpón Norte"
              {...register('nombre')}
              className={inputClass(!!errors.nombre)}
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>
            )}
          </div>

          {/* Cantidad gallinas */}
          <div>
            <label htmlFor="cantidadGallinas" className="block text-sm font-medium text-gray-700 mb-1.5">
              Cantidad de gallinas <span className="text-red-500">*</span>
            </label>
            <input
              id="cantidadGallinas"
              type="number"
              min={1}
              placeholder="Ej: 500"
              {...register('cantidadGallinas', { valueAsNumber: true })}
              className={inputClass(!!errors.cantidadGallinas)}
            />
            {errors.cantidadGallinas && (
              <p className="mt-1 text-xs text-red-500">{errors.cantidadGallinas.message}</p>
            )}
          </div>

          {/* Semanas aproximadas - slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="semanasAproximadas" className="text-sm font-medium text-gray-700">
                Semanas aproximadas de las gallinas <span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                {semanasValue ?? 20} sem.
              </span>
            </div>
            <input
              id="semanasAproximadas"
              type="range"
              min={1}
              max={120}
              step={1}
              {...register('semanasAproximadas', { valueAsNumber: true })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 sem.</span>
              <span>Pico prod. (20–45)</span>
              <span>120 sem.</span>
            </div>
            {errors.semanasAproximadas && (
              <p className="mt-1 text-xs text-red-500">{errors.semanasAproximadas.message}</p>
            )}
          </div>

          {/* Raza */}
          <div>
            <label htmlFor="raza" className="block text-sm font-medium text-gray-700 mb-1.5">
              Raza
              <span className="text-gray-400 font-normal ml-1 text-xs">(opcional)</span>
            </label>
            <input
              id="raza"
              type="text"
              placeholder="Ej: Isa Brown, Leghorn, Criolla"
              {...register('raza')}
              className={inputClass(false)}
            />
          </div>

          {/* Add button */}
          <button
            type="submit"
            disabled={isFinalizing}
            className="w-full h-11 bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 text-sm font-semibold rounded-lg
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              transition-all disabled:opacity-60
              flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {galpones.length === 0 ? 'Agregar galpón' : 'Agregar otro galpón'}
          </button>
        </form>

        {/* Finalize button */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <button
            type="button"
            onClick={handleFinalize}
            disabled={isFinalizing || galpones.length === 0}
            className="w-full h-12 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-bold rounded-lg
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              transition-all disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {isFinalizing ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Finalizando configuración...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Finalizar y comenzar
                {galpones.length > 0 && (
                  <span className="ml-1 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                    {galpones.length} galpón{galpones.length !== 1 ? 'es' : ''}
                  </span>
                )}
              </>
            )}
          </button>

          {galpones.length === 0 && (
            <p className="mt-2 text-xs text-center text-gray-400">
              Agrega al menos un galpón para continuar
            </p>
          )}
        </div>
      </div>
    </>
  )
}
