import mongoose, { Schema, Document, Types } from 'mongoose'
import { ProviderType } from '@/types'

export interface IUsuarioDocument extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  password?: string
  image?: string
  provider: ProviderType
  negocioId?: Types.ObjectId
  onboardingCompleto: boolean
  createdAt: Date
  updatedAt: Date
}

const usuarioSchema = new Schema<IUsuarioDocument>(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    image: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['google', 'credentials'],
      required: true,
    },
    negocioId: {
      type: Schema.Types.ObjectId,
      ref: 'Negocio',
    },
    onboardingCompleto: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

usuarioSchema.index({ email: 1 }, { unique: true })

export default mongoose.models.Usuario ||
  mongoose.model<IUsuarioDocument>('Usuario', usuarioSchema)
