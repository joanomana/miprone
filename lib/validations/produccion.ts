import { z } from 'zod'

export const registroProduccionSchema = z.object({
  galponId: z.string().min(1, 'El galpón es obligatorio'),
  fecha: z.coerce.date({ error: 'Fecha inválida' }),
  turno: z.enum(['mañana', 'tarde', 'noche'], {
    error: 'El turno debe ser mañana, tarde o noche',
  }),
  cantidadHuevos: z
    .number({ error: 'Debe ser un número' })
    .min(0, 'No puede ser negativo'),
  huevosRotos: z
    .number({ error: 'Debe ser un número' })
    .min(0, 'No puede ser negativo'),
  mortalidad: z
    .number({ error: 'Debe ser un número' })
    .min(0, 'No puede ser negativo'),
  observaciones: z.string().optional(),
})

export type RegistroProduccionInput = z.infer<typeof registroProduccionSchema>
