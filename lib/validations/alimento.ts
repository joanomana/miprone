import { z } from 'zod'

export const registroAlimentoSchema = z.object({
  galponId: z.string().min(1, 'El galpón es obligatorio'),
  fecha: z.coerce.date({ error: 'Fecha inválida' }),
  tipoAlimento: z.string().min(1, 'El tipo de alimento es obligatorio'),
  cantidadKg: z
    .number({ error: 'Debe ser un número' })
    .min(0.1, 'La cantidad mínima es 0.1 kg'),
  costoUnitario: z
    .number({ error: 'Debe ser un número' })
    .min(0, 'El costo no puede ser negativo'),
  observaciones: z.string().optional(),
})

export type RegistroAlimentoInput = z.infer<typeof registroAlimentoSchema>
