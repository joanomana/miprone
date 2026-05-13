'use client'

import { useState, useEffect, useCallback } from 'react'
import { IGalpon } from '@/types'

interface UseGalponesReturn {
  galpones: IGalpon[]
  isLoading: boolean
  error: string | null
  mutate: () => void
}

export function useGalpones(): UseGalponesReturn {
  const [galpones, setGalpones] = useState<IGalpon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const fetchGalpones = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/galpones')
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }
      const data = await res.json()
      setGalpones(data.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los galpones')
    } finally {
      setIsLoading(false)
    }
  }, [version])

  useEffect(() => {
    fetchGalpones()
  }, [fetchGalpones])

  const mutate = useCallback(() => setVersion((v) => v + 1), [])

  return { galpones, isLoading, error, mutate }
}
