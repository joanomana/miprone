'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import ColombiaSelector from '@/components/onboarding/ColombiaSelector'

const negocioSchema = z.object({
  nombreFinca: z.string().min(2, 'El nombre de la finca debe tener al menos 2 caracteres'),
  departamento: z.string().min(1, 'Selecciona un departamento'),
  ciudad: z.string().min(1, 'Selecciona una ciudad'),
  telefono: z
    .string()
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .regex(/^[0-9+\s()-]+$/, 'Teléfono inválido'),
  direccion: z.string().optional(),
})

export type NegocioFormData = z.infer<typeof negocioSchema>

interface NegocioFormProps {
  onSubmit: (data: NegocioFormData) => Promise<void>
  isLoading?: boolean
}

export default function NegocioForm({ onSubmit, isLoading }: NegocioFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NegocioFormData>({
    resolver: zodResolver(negocioSchema),
    defaultValues: {
      nombreFinca: '',
      departamento: '',
      ciudad: '',
      telefono: '',
      direccion: '',
    },
  })

  const departamento = watch('departamento')
  const ciudad = watch('ciudad')

  function handleDepartamentoChange(value: string) {
    setValue('departamento', value, { shouldValidate: true })
    setValue('ciudad', '', { shouldValidate: false })
  }

  function handleCiudadChange(value: string) {
    setValue('ciudad', value, { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Nombre de la finca */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Nombre de la finca <span className="text-red-500">*</span>
        </label>
        <input
          {...register('nombreFinca')}
          type="text"
          placeholder="Ej: Granja El Paraíso"
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
        {errors.nombreFinca && (
          <p className="mt-1 text-xs text-red-600">{errors.nombreFinca.message}</p>
        )}
      </div>

      {/* Departamento / Ciudad */}
      <ColombiaSelector
        departamentoValue={departamento}
        ciudadValue={ciudad}
        onDepartamentoChange={(val) => handleDepartamentoChange(val)}
        onCiudadChange={handleCiudadChange}
        errors={{
          departamento: errors.departamento?.message,
          ciudad: errors.ciudad?.message,
        }}
      />

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Teléfono de contacto <span className="text-red-500">*</span>
        </label>
        <input
          {...register('telefono')}
          type="tel"
          placeholder="Ej: 3101234567"
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
        {errors.telefono && (
          <p className="mt-1 text-xs text-red-600">{errors.telefono.message}</p>
        )}
      </div>

      {/* Dirección (opcional) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Dirección{' '}
          <span className="text-gray-400 font-normal text-xs">(opcional)</span>
        </label>
        <input
          {...register('direccion')}
          type="text"
          placeholder="Ej: Vereda La Esperanza, km 5 vía"
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Guardando...
          </>
        ) : (
          'Continuar →'
        )}
      </button>
    </form>
  )
}
