'use client'

import { useEffect, useRef } from 'react'
import { useAlertasStore } from '@/store/useAlertasStore'
import { IAlerta } from '@/types'

const POLLING_INTERVAL_MS = 30_000

interface UseAlertasReturn {
  alertas: IAlerta[]
  alertasNoLeidas: number
  isLoading: boolean
  marcarLeida: (id: string) => Promise<void>
  marcarTodasLeidas: () => Promise<void>
  refetch: () => Promise<void>
}

export function useAlertas(): UseAlertasReturn {
  const { alertas, alertasNoLeidas, fetchAlertas, marcarLeida, marcarTodasLeidas } =
    useAlertasStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchAlertas()

    intervalRef.current = setInterval(() => {
      fetchAlertas()
    }, POLLING_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    alertas,
    alertasNoLeidas,
    isLoading: false,
    marcarLeida,
    marcarTodasLeidas,
    refetch: fetchAlertas,
  }
}
