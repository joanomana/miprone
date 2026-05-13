import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import Usuario from '@/models/Usuario'
import { registroSchema } from '@/lib/validations/usuario'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate with Zod
    const parsed = registroSchema.safeParse(body)
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: errors },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    await connectDB()

    // Check if email already exists
    const existing = await Usuario.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una cuenta con este correo electrónico' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await Usuario.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      provider: 'credentials',
      onboardingCompleto: false,
    })

    return NextResponse.json(
      {
        success: true,
        userId: newUser._id.toString(),
        message: 'Cuenta creada exitosamente',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/usuarios]', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
