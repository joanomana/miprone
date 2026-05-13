'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { galponSchema, GalponInput } from '@/lib/validations/galpon'
import Link from 'next/link'

interface GalponFormProps {
  defaultValues?: Partial<GalponInput>
  onSubmit: (data: GalponInput) => void | Promise<void>
  isLoading?: boolean
}

export default function GalponForm({ defaultValues, onSubmit, isLoading }: GalponFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GalponInput>({
    resolver: zodResolver(galponSchema),
    defaultValues: {
      nombre: '',
      cantidadGallinas: 100,
      semanasAproximadas: 20,
      raza: '',
      ...defaultValues,
    },
  })

  const semanas = watch('semanasAproximadas')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Nombre del galpón <span className="text-red-500">*</span>
        </label>
        <input
          {...register('nombre')}
          type="text"
          placeholder="Ej: Galpón A, Nave 1"
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
        {errors.nombre && (
          <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>
        )}
      </div>

      {/* Cantidad de gallinas */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Cantidad de gallinas <span className="text-red-500">*</span>
        </label>
        <input
          {...register('cantidadGallinas', { valueAsNumber: true })}
          type="number"
          min={1}
          max={100000}
          placeholder="Ej: 500"
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
        {errors.cantidadGallinas && (
          <p className="mt-1 text-xs text-red-600">{errors.cantidadGallinas.message}</p>
        )}
      </div>

      {/* Semanas aproximadas — slider */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Semanas de vida aproximadas{' '}
          <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
            {semanas} sem
          </span>
        </label>
        <input
          type="range"
          min={1}
          max={120}
          value={semanas}
          onChange={(e) => setValue('semanasAproximadas', Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-green-600 bg-gray-200"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1 sem</span>
          <span>30 sem</span>
          <span>60 sem</span>
          <span>90 sem</span>
          <span>120 sem</span>
        </div>
        {errors.semanasAproximadas && (
          <p className="mt-1 text-xs text-red-600">{errors.semanasAproximadas.message}</p>
        )}
      </div>

      {/* Raza (opcional) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Raza{' '}
          <span className="text-gray-400 font-normal text-xs">(opcional)</span>
        </label>
        <input
          {...register('raza')}
          type="text"
          placeholder="Ej: Isa Brown, Lohmann"
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Link
          href="/galpones"
          className="flex-1 text-center py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar galpón'
          )}
        </button>
      </div>
    </form>
  )
}
