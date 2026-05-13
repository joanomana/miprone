import { z } from 'zod'

export const registroSchema = z
  .object({
    name: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(80, 'El nombre no puede superar 80 caracteres'),
    email: z
      .string()
      .min(1, 'El correo es obligatorio')
      .email('Ingresa un correo válido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export const onboardingNegocioSchema = z.object({
  nombreFinca: z
    .string()
    .min(2, 'El nombre de la finca debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  departamento: z.string().min(1, 'El departamento es obligatorio'),
  ciudad: z.string().min(1, 'La ciudad es obligatoria'),
  telefono: z
    .string()
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .regex(/^[0-9+\-\s()]+$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('')),
  direccion: z.string().max(200).optional(),
})

export type RegistroInput = z.infer<typeof registroSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type OnboardingNegocioInput = z.infer<typeof onboardingNegocioSchema>
