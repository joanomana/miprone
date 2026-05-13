import { z } from 'zod'

export const galponSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede superar 50 caracteres'),
  cantidadGallinas: z
    .number({ error: 'Debe ser un número' })
    .int('Debe ser un número entero')
    .min(1, 'Debe haber al menos 1 gallina')
    .max(100000, 'No puede superar 100.000 gallinas'),
  semanasAproximadas: z
    .number({ error: 'Debe ser un número' })
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 semana')
    .max(120, 'No puede superar 120 semanas'),
  raza: z.string().optional(),
})

export type GalponInput = z.infer<typeof galponSchema>
