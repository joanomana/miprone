import { Types } from 'mongoose'

export type ProviderType = 'google' | 'credentials'
export type TurnoType = 'mañana' | 'tarde' | 'noche'
export type AlertaTipo = 'baja_produccion' | 'mortalidad_alta' | 'alimento_bajo' | 'anomalia' | 'recordatorio'
export type AlertaSeveridad = 'info' | 'warning' | 'critical'
export type CategoríaCosto = 'alimento' | 'medicamento' | 'mano_obra' | 'servicios' | 'otro'

export interface IUsuario {
  _id: Types.ObjectId | string
  name: string
  email: string
  password?: string
  image?: string
  provider: ProviderType
  negocioId?: Types.ObjectId | string
  onboardingCompleto: boolean
  createdAt: Date
  updatedAt: Date
}

export interface INegocio {
  _id: Types.ObjectId | string
  usuarioId: Types.ObjectId | string
  nombreFinca: string
  departamento: string
  ciudad: string
  telefono: string
  direccion?: string
  createdAt: Date
  updatedAt: Date
}

export interface IGalpon {
  _id: Types.ObjectId | string
  negocioId: Types.ObjectId | string
  usuarioId: Types.ObjectId | string
  nombre: string
  cantidadGallinas: number
  semanasAproximadas: number
  raza?: string
  activo: boolean
  fechaIngreso: Date
  createdAt: Date
  updatedAt: Date
}

export interface IRegistroProduccion {
  _id: Types.ObjectId | string
  galponId: Types.ObjectId | string
  usuarioId: Types.ObjectId | string
  fecha: Date
  turno: TurnoType
  cantidadHuevos: number
  huevosRotos: number
  mortalidad: number
  observaciones?: string
  registradoPor: string
  createdAt: Date
  updatedAt: Date
}

export interface IRegistroAlimento {
  _id: Types.ObjectId | string
  galponId: Types.ObjectId | string
  usuarioId: Types.ObjectId | string
  fecha: Date
  tipoAlimento: string
  cantidadKg: number
  costoUnitario: number
  costoTotal: number
  inventarioRestante: number
  observaciones?: string
  createdAt: Date
  updatedAt: Date
}

export interface IAlerta {
  _id: Types.ObjectId | string
  usuarioId: Types.ObjectId | string
  galponId: Types.ObjectId | string
  tipo: AlertaTipo
  severidad: AlertaSeveridad
  titulo: string
  mensaje: string
  leida: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ICosto {
  _id: Types.ObjectId | string
  negocioId: Types.ObjectId | string
  usuarioId: Types.ObjectId | string
  galponId?: Types.ObjectId | string
  fecha: Date
  descripcion: string
  categoria: CategoríaCosto
  monto: number
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface EstadisticasProduccion {
  totalHoy: number
  promedioSemanal: number
  tendencia: 'up' | 'down' | 'stable'
}

export interface Departamento {
  id: number
  nombre: string
}

export interface Ciudad {
  id: number
  nombre: string
  departamentoId: number
}
