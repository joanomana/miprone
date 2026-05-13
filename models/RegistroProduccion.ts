import mongoose, { Schema, Document, Types } from 'mongoose'
import { TurnoType } from '@/types'

export interface IRegistroProduccionDocument extends Document {
  _id: Types.ObjectId
  galponId: Types.ObjectId
  usuarioId: Types.ObjectId
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

const registroProduccionSchema = new Schema<IRegistroProduccionDocument>(
  {
    galponId: {
      type: Schema.Types.ObjectId,
      ref: 'Galpon',
      required: [true, 'El galpón es obligatorio'],
    },
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El usuario es obligatorio'],
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
    },
    turno: {
      type: String,
      enum: ['mañana', 'tarde', 'noche'],
      required: [true, 'El turno es obligatorio'],
    },
    cantidadHuevos: {
      type: Number,
      required: [true, 'La cantidad de huevos es obligatoria'],
      min: [0, 'No puede ser negativo'],
    },
    huevosRotos: {
      type: Number,
      default: 0,
      min: [0, 'No puede ser negativo'],
    },
    mortalidad: {
      type: Number,
      default: 0,
      min: [0, 'No puede ser negativo'],
    },
    observaciones: {
      type: String,
      trim: true,
    },
    registradoPor: {
      type: String,
      required: [true, 'Registrado por es obligatorio'],
      trim: true,
    },
  },
  { timestamps: true }
)

registroProduccionSchema.index({ galponId: 1, fecha: 1, turno: 1 }, { unique: true })

export default mongoose.models.RegistroProduccion ||
  mongoose.model<IRegistroProduccionDocument>('RegistroProduccion', registroProduccionSchema)
