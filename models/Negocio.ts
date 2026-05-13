import mongoose, { Schema, Document, Types } from 'mongoose'

export interface INegocioDocument extends Document {
  _id: Types.ObjectId
  usuarioId: Types.ObjectId
  nombreFinca: string
  departamento: string
  ciudad: string
  telefono: string
  direccion?: string
  createdAt: Date
  updatedAt: Date
}

const negocioSchema = new Schema<INegocioDocument>(
  {
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El usuario es obligatorio'],
    },
    nombreFinca: {
      type: String,
      required: [true, 'El nombre de la finca es obligatorio'],
      trim: true,
    },
    departamento: {
      type: String,
      required: [true, 'El departamento es obligatorio'],
      trim: true,
    },
    ciudad: {
      type: String,
      required: [true, 'La ciudad es obligatoria'],
      trim: true,
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true,
    },
    direccion: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
)

export default mongoose.models.Negocio ||
  mongoose.model<INegocioDocument>('Negocio', negocioSchema)
