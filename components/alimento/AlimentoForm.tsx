'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registroAlimentoSchema, RegistroAlimentoInput } from '@/lib/validations/alimento'
import { IGalpon } from '@/types'
import { useState, useEffect } from 'react'

interface AlimentoFormProps {
  galponId?: string
  galpones?: IGalpon[]
  onSuccess?: () => void
}

const tiposAlimento = ['Concentrado', 'Maíz', 'Mezclado', 'Otro']

export default function AlimentoForm({ galponId, galpones, onSuccess }: AlimentoFormProps) {
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
  } = useForm<RegistroAlimentoInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(registroAlimentoSchema) as any,
    defaultValues: {
      galponId: galponId ?? '',
      fecha: new Date(today),
      tipoAlimento: 'Concentrado',
      cantidadKg: 0,
      costoUnitario: 0,
      observaciones: '',
    },
  })

  const cantidadKg = watch('cantidadKg')
  const costoUnitario = watch('costoUnitario')
  const costoTotal = (Number(cantidadKg) || 0) * (Number(costoUnitario) || 0)

  // Sync galponId if provided externally
  useEffect(() => {
    if (galponId) setValue('galponId', galponId)
  }, [galponId, setValue])

  async function onSubmit(data: RegistroAlimentoInput) {
    setIsLoading(true)
    setError('')
    try {
      const targetGalponId = galponId ?? data.galponId
      const body = { ...data, fecha: data.fecha.toISOString() }
      const res = await fetch(`/api/galpones/${targetGalponId}/alimento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error ?? 'Error al guardar')
      reset({
        galponId: galponId ?? '',
        fecha: new Date(today),
        tipoAlimento: 'Concentrado',
        cantidadKg: 0,
        costoUnitario: 0,
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

      {/* Selector de galpón */}
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
                {g.nombre}
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
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>

        {/* Tipo de alimento */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Tipo de alimento <span className="text-red-500">*</span>
          </label>
          <select
            {...register('tipoAlimento')}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          >
            {tiposAlimento.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.tipoAlimento && (
            <p className="mt-1 text-xs text-red-600">{errors.tipoAlimento.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Cantidad Kg */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Cantidad (kg) <span className="text-red-500">*</span>
          </label>
          <input
            {...register('cantidadKg', { valueAsNumber: true })}
            type="number"
            min={0.1}
            step={0.1}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
          {errors.cantidadKg && (
            <p className="mt-1 text-xs text-red-600">{errors.cantidadKg.message}</p>
          )}
        </div>

        {/* Costo unitario */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Costo/kg (COP) <span className="text-red-500">*</span>
          </label>
          <input
            {...register('costoUnitario', { valueAsNumber: true })}
            type="number"
            min={0}
            step={1}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>

        {/* Costo total (auto-calculado) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Costo total</label>
          <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-green-700">
            ${costoTotal.toLocaleString('es-CO')}
          </div>
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
          placeholder="Proveedor, calidad del alimento..."
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
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
          'Registrar suministro'
        )}
      </button>
    </form>
  )
}
