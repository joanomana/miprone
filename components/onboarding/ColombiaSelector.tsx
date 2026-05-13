'use client'

import { useState, useEffect } from 'react'

interface Departamento {
  id: number
  name: string
}

interface Ciudad {
  id: number
  name: string
}

interface ColombiaSelectorProps {
  departamentoValue: string
  ciudadValue: string
  onDepartamentoChange: (departamento: string, departamentoId: number) => void
  onCiudadChange: (ciudad: string) => void
  errors?: {
    departamento?: string
    ciudad?: string
  }
}

export default function ColombiaSelector({
  departamentoValue,
  ciudadValue,
  onDepartamentoChange,
  onCiudadChange,
  errors,
}: ColombiaSelectorProps) {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [loadingDepts, setLoadingDepts] = useState(true)
  const [loadingCities, setLoadingCities] = useState(false)
  const [selectedDptId, setSelectedDptId] = useState<number | null>(null)

  // Load departments on mount
  useEffect(() => {
    async function fetchDepartamentos() {
      try {
        setLoadingDepts(true)
        const res = await fetch('https://api-colombia.com/api/v1/Department')
        if (!res.ok) throw new Error('Error fetching departments')
        const data: Departamento[] = await res.json()
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name))
        setDepartamentos(sorted)
      } catch (err) {
        console.error('Error loading departments:', err)
        // Fallback with most common departments
        setDepartamentos([
          { id: 1, name: 'Amazonas' },
          { id: 2, name: 'Antioquia' },
          { id: 3, name: 'Arauca' },
          { id: 4, name: 'Atlántico' },
          { id: 5, name: 'Bolívar' },
          { id: 6, name: 'Boyacá' },
          { id: 7, name: 'Caldas' },
          { id: 8, name: 'Caquetá' },
          { id: 9, name: 'Casanare' },
          { id: 10, name: 'Cauca' },
          { id: 11, name: 'Cesar' },
          { id: 12, name: 'Chocó' },
          { id: 13, name: 'Córdoba' },
          { id: 14, name: 'Cundinamarca' },
          { id: 15, name: 'Guainía' },
          { id: 16, name: 'Guaviare' },
          { id: 17, name: 'Huila' },
          { id: 18, name: 'La Guajira' },
          { id: 19, name: 'Magdalena' },
          { id: 20, name: 'Meta' },
          { id: 21, name: 'Nariño' },
          { id: 22, name: 'Norte de Santander' },
          { id: 23, name: 'Putumayo' },
          { id: 24, name: 'Quindío' },
          { id: 25, name: 'Risaralda' },
          { id: 26, name: 'San Andrés y Providencia' },
          { id: 27, name: 'Santander' },
          { id: 28, name: 'Sucre' },
          { id: 29, name: 'Tolima' },
          { id: 30, name: 'Valle del Cauca' },
          { id: 31, name: 'Vaupés' },
          { id: 32, name: 'Vichada' },
        ])
      } finally {
        setLoadingDepts(false)
      }
    }

    fetchDepartamentos()
  }, [])

  // Load cities when department changes
  useEffect(() => {
    if (selectedDptId === null) {
      setCiudades([])
      return
    }

    async function fetchCiudades(deptId: number) {
      try {
        setLoadingCities(true)
        const res = await fetch(
          `https://api-colombia.com/api/v1/Department/${deptId}/cities`
        )
        if (!res.ok) throw new Error('Error fetching cities')
        const data: Ciudad[] = await res.json()
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name))
        setCiudades(sorted)
      } catch (err) {
        console.error('Error loading cities:', err)
        setCiudades([])
      } finally {
        setLoadingCities(false)
      }
    }

    fetchCiudades(selectedDptId)
  }, [selectedDptId])

  function handleDepartamentoChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedName = e.target.value
    const dept = departamentos.find((d) => d.name === selectedName)
    if (dept) {
      setSelectedDptId(dept.id)
      onDepartamentoChange(selectedName, dept.id)
      onCiudadChange('') // reset city
    } else {
      setSelectedDptId(null)
      onDepartamentoChange('', 0)
      onCiudadChange('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Departamento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Departamento <span className="text-red-500">*</span>
        </label>
        {loadingDepts ? (
          <div className="h-11 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <select
            value={departamentoValue}
            onChange={handleDepartamentoChange}
            className={`
              w-full h-11 px-3 rounded-lg border bg-white text-sm text-gray-800
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
              transition-colors
              ${errors?.departamento ? 'border-red-400' : 'border-gray-300'}
            `}
          >
            <option value="">Selecciona tu departamento</option>
            {departamentos.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        )}
        {errors?.departamento && (
          <p className="mt-1 text-xs text-red-500">{errors.departamento}</p>
        )}
      </div>

      {/* Ciudad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Ciudad / Municipio <span className="text-red-500">*</span>
        </label>
        {loadingCities ? (
          <div className="h-11 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <select
            value={ciudadValue}
            onChange={(e) => onCiudadChange(e.target.value)}
            disabled={!departamentoValue || ciudades.length === 0}
            className={`
              w-full h-11 px-3 rounded-lg border bg-white text-sm text-gray-800
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
              transition-colors disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
              ${errors?.ciudad ? 'border-red-400' : 'border-gray-300'}
            `}
          >
            <option value="">
              {!departamentoValue
                ? 'Primero selecciona un departamento'
                : ciudades.length === 0
                ? 'Sin ciudades disponibles'
                : 'Selecciona tu ciudad'}
            </option>
            {ciudades.map((city) => (
              <option key={city.id} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        )}
        {errors?.ciudad && (
          <p className="mt-1 text-xs text-red-500">{errors.ciudad}</p>
        )}
      </div>
    </div>
  )
}
