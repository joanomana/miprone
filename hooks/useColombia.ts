'use client'

import { useState, useEffect, useCallback } from 'react'
import { Departamento, Ciudad } from '@/types'

interface UseDepartamentosReturn {
  departamentos: Departamento[]
  isLoading: boolean
  error: string | null
}

interface UseCiudadesReturn {
  ciudades: Ciudad[]
  isLoading: boolean
  error: string | null
}

export function useDepartamentos(): UseDepartamentosReturn {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDepartamentos = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/colombia/departamentos')
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data = await res.json()
        setDepartamentos(data.data ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar departamentos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDepartamentos()
  }, [])

  return { departamentos, isLoading, error }
}

export function useCiudades(departamentoId: number | null): UseCiudadesReturn {
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCiudades = useCallback(async (id: number) => {
    setIsLoading(true)
    setError(null)
    setCiudades([])
    try {
      const res = await fetch(`/api/colombia/departamentos/${id}/ciudades`)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setCiudades(data.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ciudades')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (departamentoId !== null && departamentoId > 0) {
      fetchCiudades(departamentoId)
    } else {
      setCiudades([])
    }
  }, [departamentoId, fetchCiudades])

  return { ciudades, isLoading, error }
}

export function useColombia() {
  const departamentosResult = useDepartamentos()
  const [departamentoId, setDepartamentoId] = useState<number | null>(null)
  const ciudadesResult = useCiudades(departamentoId)

  return {
    ...departamentosResult,
    ciudades: ciudadesResult.ciudades,
    ciudadesLoading: ciudadesResult.isLoading,
    ciudadesError: ciudadesResult.error,
    departamentoId,
    setDepartamentoId,
  }
}
