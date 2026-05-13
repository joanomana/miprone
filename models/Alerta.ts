import mongoose, { Schema, Document, Types } from 'mongoose'
import { AlertaTipo, AlertaSeveridad } from '@/types'

export interface IAlertaDocument extends Document {
  _id: Types.ObjectId
  usuarioId: Types.ObjectId
  galponId: Types.ObjectId
  tipo: AlertaTipo
  severidad: AlertaSeveridad
  titulo: string
  mensaje: string
  leida: boolean
  createdAt: Date
  updatedAt: Date
}

const alertaSchema = new Schema<IAlertaDocument>(
  {
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El usuario es obligatorio'],
    },
    galponId: {
      type: Schema.Types.ObjectId,
      ref: 'Galpon',
      required: [true, 'El galpón es obligatorio'],
    },
    tipo: {
      type: String,
      enum: ['baja_produccion', 'mortalidad_alta', 'alimento_bajo', 'anomalia', 'recordatorio'],
      required: [true, 'El tipo de alerta es obligatorio'],
    },
    severidad: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      required: [true, 'La severidad es obligatoria'],
    },
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
    },
    mensaje: {
      type: String,
      required: [true, 'El mensaje es obligatorio'],
      trim: true,
    },
    leida: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

alertaSchema.index({ usuarioId: 1, leida: 1 })

export default mongoose.models.Alerta ||
  mongoose.model<IAlertaDocument>('Alerta', alertaSchema)
