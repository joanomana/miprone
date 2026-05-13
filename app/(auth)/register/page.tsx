'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { registroSchema, RegistroInput } from '@/lib/validations/usuario'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistroInput>({
    resolver: zodResolver(registroSchema),
  })

  async function onSubmit(data: RegistroInput) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Error al crear la cuenta. Intenta de nuevo.')
        return
      }

      toast.success('¡Cuenta creada! Iniciando sesión...')

      // Auto sign-in after register
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Cuenta creada, pero no se pudo iniciar sesión automáticamente.')
        router.push('/login')
        return
      }

      router.push('/negocio')
      router.refresh()
    } catch {
      toast.error('Error de red. Verifica tu conexión e intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl: '/negocio' })
    } catch {
      toast.error('Error al conectar con Google. Intenta de nuevo.')
      setIsGoogleLoading(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full h-11 px-3.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
    transition-colors
    ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-green-100/50 border border-gray-100 p-8">
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-gray-900">Crea tu cuenta</h2>
        <p className="text-sm text-gray-500 mt-1">
          Empieza a digitalizar tu granja avícola hoy
        </p>
      </div>

      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
        className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed mb-5"
      >
        {isGoogleLoading ? (
          <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        Registrarse con Google
      </button>

      {/* Divider */}
      <div className="relative flex items-center mb-5">
        <div className="flex-1 border-t border-gray-200" />
        <span className="px-3 text-xs text-gray-400 font-medium">o con correo y contraseña</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre completo
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre"
            {...register('name')}
            className={inputClass(!!errors.name)}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            {...register('email')}
            className={inputClass(!!errors.email)}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            {...register('password')}
            className={inputClass(!!errors.password)}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            {...register('confirmPassword')}
            className={inputClass(!!errors.confirmPassword)}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
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
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta gratis'
          )}
        </button>

        <p className="text-xs text-gray-400 text-center pt-1">
          Al registrarte aceptas usar la plataforma responsablemente.
        </p>
      </form>

      {/* Login link */}
      <p className="mt-5 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/login"
          className="text-green-600 font-semibold hover:text-green-700 transition-colors"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
