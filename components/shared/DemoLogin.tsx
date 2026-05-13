'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function DemoLogin() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === '1'
  const [loading, setLoading] = useState(false)
  const [cargado, setCargado] = useState(false)

  if (!isDemo) return null

  async function cargarDatos() {
    if (loading || cargado) return
    setLoading(true)
    try {
      const res = await fetch('/api/seed')
      const text = await res.text()
      let data: { success: boolean; error?: string; detalle?: string }
      try {
        data = JSON.parse(text)
      } catch {
        console.error('[DemoLogin] Respuesta no-JSON del servidor:', text.slice(0, 500))
        toast.error(`Error del servidor (${res.status}). Revisa la consola del navegador.`)
        return
      }
      if (data.success) {
        setCargado(true)
        toast.success('Datos de demo cargados. Ya puedes iniciar sesión.')
      } else {
        const msg = data.detalle ?? data.error ?? 'Error desconocido'
        console.error('[DemoLogin] Error del seed:', msg)
        toast.error(`Error: ${msg}`)
      }
    } catch (err) {
      console.error('[DemoLogin] Error de red:', err)
      toast.error('No se pudo conectar con el servidor. ¿Está corriendo npm run dev?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
      <div className="flex items-start gap-3">
        {/* Icono */}
        <div className="mt-0.5 flex-shrink-0">
          <svg
            className="h-5 w-5 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"
            />
          </svg>
        </div>

        {/* Texto */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-green-800">Demo disponible</p>
          <p className="mt-0.5 text-sm text-green-700">
            <span className="font-medium">Email:</span>{' '}
            <span className="font-mono">demo@miprone.com</span>
            <span className="mx-2 text-green-400">·</span>
            <span className="font-medium">Contraseña:</span>{' '}
            <span className="font-mono">demo1234</span>
          </p>
        </div>
      </div>

      {/* Botón */}
      <button
        type="button"
        onClick={cargarDatos}
        disabled={loading || cargado}
        className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white
          hover:bg-green-700 active:bg-green-800 transition-colors
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Cargando datos...
          </>
        ) : cargado ? (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Datos cargados — inicia sesión
          </>
        ) : (
          'Cargar datos de demo'
        )}
      </button>
    </div>
  )
}
