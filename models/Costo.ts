import mongoose, { Schema, Document, Types } from 'mongoose'
import { CategoríaCosto } from '@/types'

export interface ICostoDocument extends Document {
  _id: Types.ObjectId
  negocioId: Types.ObjectId
  usuarioId: Types.ObjectId
  galponId?: Types.ObjectId
  fecha: Date
  descripcion: string
  categoria: CategoríaCosto
  monto: number
  createdAt: Date
  updatedAt: Date
}

const costoSchema = new Schema<ICostoDocument>(
  {
    negocioId: {
      type: Schema.Types.ObjectId,
      ref: 'Negocio',
      required: [true, 'El negocio es obligatorio'],
    },
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El usuario es obligatorio'],
    },
    galponId: {
      type: Schema.Types.ObjectId,
      ref: 'Galpon',
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
    },
    categoria: {
      type: String,
      enum: ['alimento', 'medicamento', 'mano_obra', 'servicios', 'otro'],
      required: [true, 'La categoría es obligatoria'],
    },
    monto: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: [0, 'El monto no puede ser negativo'],
    },
  },
  { timestamps: true }
)

export default mongoose.models.Costo ||
  mongoose.model<ICostoDocument>('Costo', costoSchema)
