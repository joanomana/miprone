import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IRegistroAlimentoDocument extends Document {
  _id: Types.ObjectId
  galponId: Types.ObjectId
  usuarioId: Types.ObjectId
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

const registroAlimentoSchema = new Schema<IRegistroAlimentoDocument>(
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
    tipoAlimento: {
      type: String,
      required: [true, 'El tipo de alimento es obligatorio'],
      trim: true,
    },
    cantidadKg: {
      type: Number,
      required: [true, 'La cantidad en kg es obligatoria'],
      min: [0.1, 'Mínimo 0.1 kg'],
    },
    costoUnitario: {
      type: Number,
      required: [true, 'El costo unitario es obligatorio'],
      min: [0, 'No puede ser negativo'],
    },
    costoTotal: {
      type: Number,
      default: 0,
    },
    inventarioRestante: {
      type: Number,
      default: 0,
    },
    observaciones: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
)

registroAlimentoSchema.pre('save', function () {
  this.costoTotal = this.cantidadKg * this.costoUnitario
})

export default mongoose.models.RegistroAlimento ||
  mongoose.model<IRegistroAlimentoDocument>('RegistroAlimento', registroAlimentoSchema)
