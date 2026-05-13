'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registroProduccionSchema, RegistroProduccionInput } from '@/lib/validations/produccion'
import { IGalpon, TurnoType } from '@/types'
import { useState } from 'react'

interface RegistroFormProps {
  galponId?: string
  galpones?: IGalpon[]
  onSuccess?: () => void
}

const turnos: { value: TurnoType; label: string; color: string }[] = [
  { value: 'mañana', label: 'Mañana', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'tarde', label: 'Tarde', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'noche', label: 'Noche', color: 'bg-purple-100 text-purple-700 border-purple-300' },
]

export default function RegistroForm({ galponId, galpones, onSuccess }: RegistroFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegistroProduccionInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(registroProduccionSchema) as any,
    defaultValues: {
      galponId: galponId ?? '',
      fecha: new Date(today),
      turno: 'mañana',
      cantidadHuevos: 0,
      huevosRotos: 0,
      mortalidad: 0,
      observaciones: '',
    },
  })

  const turnoSelected = watch('turno')

  async function onSubmit(data: RegistroProduccionInput) {
    setIsLoading(true)
    setError('')
    try {
      const body = { ...data, fecha: data.fecha.toISOString() }
      const targetGalponId = galponId ?? data.galponId
      const res = await fetch(`/api/galpones/${targetGalponId}/produccion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error ?? 'Error al guardar')
      reset({
        galponId: galponId ?? '',
        fecha: new Date(today),
        turno: 'mañana',
        cantidadHuevos: 0,
        huevosRotos: 0,
        mortalidad: 0,
        observaciones: '',
      })
      onSuccess?.()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Selector de galpón (si no viene galponId) */}
      {!galponId && galpones && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Galpón <span className="text-red-500">*</span>
          </label>
          <select
            {...register('galponId')}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          >
            <option value="">Seleccionar galpón...</option>
            {galpones.map((g) => (
              <option key={g._id.toString()} value={g._id.toString()}>
                {g.nombre} ({g.cantidadGallinas} gallinas)
              </option>
            ))}
          </select>
          {errors.galponId && (
            <p className="mt-1 text-xs text-red-600">{errors.galponId.message}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Fecha */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha</label>
          <input
            type="date"
            defaultValue={today}
            onChange={(e) => setValue('fecha', new Date(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>

        {/* Turno */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Turno</label>
          <div className="flex gap-2">
            {turnos.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setValue('turno', t.value)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition ${
                  turnoSelected === t.value
                    ? t.color + ' border-current shadow-sm'
                    : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Huevos */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Huevos</label>
          <input
            {...register('cantidadHuevos', { valueAsNumber: true })}
            type="number"
            min={0}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
          {errors.cantidadHuevos && (
            <p className="mt-1 text-xs text-red-600">{errors.cantidadHuevos.message}</p>
          )}
        </div>

        {/* Rotos */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rotos</label>
          <input
            {...register('huevosRotos', { valueAsNumber: true })}
            type="number"
            min={0}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>

        {/* Mortalidad */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mortalidad</label>
          <input
            {...register('mortalidad', { valueAsNumber: true })}
            type="number"
            min={0}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Observaciones <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          {...register('observaciones')}
          rows={2}
          placeholder="Novedades del turno..."
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Guardando...
          </>
        ) : (
          'Registrar producción'
        )}
      </button>
    </form>
  )
}
