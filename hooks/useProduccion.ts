'use client'

import { useState, useEffect, useCallback } from 'react'
import { IRegistroProduccion, EstadisticasProduccion } from '@/types'

interface UseProduccionReturn {
  registros: IRegistroProduccion[]
  isLoading: boolean
  error: string | null
  estadisticas: EstadisticasProduccion
  mutate: () => void
}

function calcularEstadisticas(registros: IRegistroProduccion[]): EstadisticasProduccion {
  if (registros.length === 0) {
    return { totalHoy: 0, promedioSemanal: 0, tendencia: 'stable' }
  }

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const hace7Dias = new Date(hoy)
  hace7Dias.setDate(hace7Dias.getDate() - 7)

  const hace14Dias = new Date(hoy)
  hace14Dias.setDate(hace14Dias.getDate() - 14)

  const registrosHoy = registros.filter((r) => new Date(r.fecha) >= hoy)
  const totalHoy = registrosHoy.reduce((sum, r) => sum + r.cantidadHuevos, 0)

  const registrosSemana = registros.filter(
    (r) => new Date(r.fecha) >= hace7Dias && new Date(r.fecha) < hoy
  )
  const promedioSemanal =
    registrosSemana.length > 0
      ? registrosSemana.reduce((sum, r) => sum + r.cantidadHuevos, 0) / 7
      : 0

  const registrosSemanaAnterior = registros.filter(
    (r) => new Date(r.fecha) >= hace14Dias && new Date(r.fecha) < hace7Dias
  )
  const promedioSemanaAnterior =
    registrosSemanaAnterior.length > 0
      ? registrosSemanaAnterior.reduce((sum, r) => sum + r.cantidadHuevos, 0) / 7
      : 0

  let tendencia: 'up' | 'down' | 'stable' = 'stable'
  if (promedioSemanaAnterior > 0) {
    const diff = ((promedioSemanal - promedioSemanaAnterior) / promedioSemanaAnterior) * 100
    if (diff > 5) tendencia = 'up'
    else if (diff < -5) tendencia = 'down'
  }

  return { totalHoy, promedioSemanal: Math.round(promedioSemanal), tendencia }
}

export function useProduccion(galponId: string): UseProduccionReturn {
  const [registros, setRegistros] = useState<IRegistroProduccion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const fetchRegistros = useCallback(async () => {
    if (!galponId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/galpones/${galponId}/produccion`)
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }
      const data = await res.json()
      setRegistros(data.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la producción')
    } finally {
      setIsLoading(false)
    }
  }, [galponId, version])

  useEffect(() => {
    fetchRegistros()
  }, [fetchRegistros])

  const mutate = useCallback(() => setVersion((v) => v + 1), [])
  const estadisticas = calcularEstadisticas(registros)

  return { registros, isLoading, error, estadisticas, mutate }
}
