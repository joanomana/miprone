'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import StepIndicator from '@/components/onboarding/StepIndicator'
import ColombiaSelector from '@/components/onboarding/ColombiaSelector'
import { onboardingNegocioSchema, OnboardingNegocioInput } from '@/lib/validations/usuario'

export default function NegocioPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [departamento, setDepartamento] = useState('')
  const [ciudad, setCiudad] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OnboardingNegocioInput>({
    resolver: zodResolver(onboardingNegocioSchema),
    defaultValues: {
      departamento: '',
      ciudad: '',
    },
  })

  function handleDepartamentoChange(dpto: string) {
    setDepartamento(dpto)
    setValue('departamento', dpto, { shouldValidate: true })
    setCiudad('')
    setValue('ciudad', '', { shouldValidate: false })
  }

  function handleCiudadChange(c: string) {
    setCiudad(c)
    setValue('ciudad', c, { shouldValidate: true })
  }

  async function onSubmit(data: OnboardingNegocioInput) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/negocio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Error al guardar la información. Intenta de nuevo.')
        return
      }

      toast.success('¡Finca registrada correctamente!')
      router.push('/galpon')
    } catch {
      toast.error('Error de red. Verifica tu conexión e intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full h-11 px-3.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
    transition-colors
    ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`

  return (
    <>
      <StepIndicator currentStep={1} />

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
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Cuéntanos sobre tu finca</h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Esta información nos ayuda a personalizar tu experiencia. Solo toma un minuto.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Nombre de la finca */}
          <div>
            <label htmlFor="nombreFinca" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre de la finca <span className="text-red-500">*</span>
            </label>
            <input
              id="nombreFinca"
              type="text"
              placeholder="Ej: Granja El Porvenir"
              {...register('nombreFinca')}
              className={inputClass(!!errors.nombreFinca)}
            />
            {errors.nombreFinca && (
              <p className="mt-1 text-xs text-red-500">{errors.nombreFinca.message}</p>
            )}
          </div>

          {/* Colombia Selector (Departamento + Ciudad) */}
          <ColombiaSelector
            departamentoValue={departamento}
            ciudadValue={ciudad}
            onDepartamentoChange={(dpto) => handleDepartamentoChange(dpto)}
            onCiudadChange={handleCiudadChange}
            errors={{
              departamento: errors.departamento?.message,
              ciudad: errors.ciudad?.message,
            }}
          />

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1.5">
              Teléfono de contacto
              <span className="text-gray-400 font-normal ml-1 text-xs">(opcional)</span>
            </label>
            <input
              id="telefono"
              type="tel"
              placeholder="Ej: 3001234567"
              {...register('telefono')}
              className={inputClass(!!errors.telefono)}
            />
            {errors.telefono && (
              <p className="mt-1 text-xs text-red-500">{errors.telefono.message}</p>
            )}
          </div>

          {/* Dirección */}
          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1.5">
              Dirección
              <span className="text-gray-400 font-normal ml-1 text-xs">(opcional)</span>
            </label>
            <input
              id="direccion"
              type="text"
              placeholder="Ej: Vereda Meseta de San Rafael, km 5"
              {...register('direccion')}
              className={inputClass(!!errors.direccion)}
            />
            {errors.direccion && (
              <p className="mt-1 text-xs text-red-500">{errors.direccion.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-semibold rounded-lg
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              transition-all disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </>
            ) : (
              <>
                Continuar
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </>
  )
}
