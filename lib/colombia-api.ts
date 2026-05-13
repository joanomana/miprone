import { Departamento, Ciudad } from '@/types'

const BASE_URL =
  process.env.COLOMBIA_API_URL ?? 'https://api-colombia.com/api/v1'

interface RawDepartamento {
  id: number
  name: string
}

interface RawCiudad {
  id: number
  name: string
  departmentId: number
}

export async function getDepartamentos(): Promise<Departamento[]> {
  const res = await fetch(`${BASE_URL}/Department`, { cache: 'force-cache' })

  if (!res.ok) {
    throw new Error(`Error al obtener departamentos: ${res.status}`)
  }

  const data: RawDepartamento[] = await res.json()

  return data
    .map((d) => ({ id: d.id, nombre: d.name }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export async function getCiudadesByDepartamento(departamentoId: number): Promise<Ciudad[]> {
  const res = await fetch(`${BASE_URL}/Department/${departamentoId}/cities`, {
    cache: 'force-cache',
  })

  if (!res.ok) {
    throw new Error(`Error al obtener ciudades: ${res.status}`)
  }

  const data: RawCiudad[] = await res.json()

  return data
    .map((c) => ({ id: c.id, nombre: c.name, departamentoId: c.departmentId }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
}
