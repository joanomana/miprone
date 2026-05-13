import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IGalponDocument extends Document {
  _id: Types.ObjectId
  negocioId: Types.ObjectId
  usuarioId: Types.ObjectId
  nombre: string
  cantidadGallinas: number
  semanasAproximadas: number
  raza?: string
  activo: boolean
  fechaIngreso: Date
  createdAt: Date
  updatedAt: Date
}

const galponSchema = new Schema<IGalponDocument>(
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
    nombre: {
      type: String,
      required: [true, 'El nombre del galpón es obligatorio'],
      trim: true,
    },
    cantidadGallinas: {
      type: Number,
      required: [true, 'La cantidad de gallinas es obligatoria'],
      min: [1, 'Debe haber al menos 1 gallina'],
    },
    semanasAproximadas: {
      type: Number,
      required: [true, 'Las semanas aproximadas son obligatorias'],
      min: [1, 'Mínimo 1 semana'],
    },
    raza: {
      type: String,
      trim: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
    fechaIngreso: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.models.Galpon ||
  mongoose.model<IGalponDocument>('Galpon', galponSchema)
