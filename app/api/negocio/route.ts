import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Negocio from '@/models/Negocio'
import Usuario from '@/models/Usuario'
import { onboardingNegocioSchema } from '@/lib/validations/usuario'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const parsed = onboardingNegocioSchema.safeParse(body)
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: errors },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user already has a negocio
    const existingNegocio = await Negocio.findOne({ usuarioId: session.user.id })
    if (existingNegocio) {
      return NextResponse.json(
        { success: false, error: 'Ya tienes una finca registrada' },
        { status: 409 }
      )
    }

    // Create negocio
    const negocio = await Negocio.create({
      usuarioId: session.user.id,
      ...parsed.data,
    })

    // Update user with negocioId
    await Usuario.findByIdAndUpdate(session.user.id, {
      negocioId: negocio._id,
    })

    return NextResponse.json(
      {
        success: true,
        negocioId: negocio._id.toString(),
        message: 'Finca registrada exitosamente',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/negocio]', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    await connectDB()
    const negocio = await Negocio.findOne({ usuarioId: session.user.id })

    if (!negocio) {
      return NextResponse.json(
        { success: false, error: 'No se encontró el negocio' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: negocio })
  } catch (error) {
    console.error('[GET /api/negocio]', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const allowed: Record<string, unknown> = {}
    if (body.nombreFinca !== undefined) allowed.nombreFinca = String(body.nombreFinca).trim()
    if (body.departamento !== undefined) allowed.departamento = String(body.departamento).trim()
    if (body.ciudad !== undefined) allowed.ciudad = String(body.ciudad).trim()
    if (body.telefono !== undefined) allowed.telefono = String(body.telefono).trim()
    if (body.direccion !== undefined) allowed.direccion = String(body.direccion).trim()

    await connectDB()
    const negocio = await Negocio.findOneAndUpdate(
      { usuarioId: session.user.id },
      { $set: allowed },
      { new: true }
    )

    if (!negocio) {
      return NextResponse.json({ success: false, error: 'No se encontró el negocio' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: negocio })
  } catch (error) {
    console.error('[PUT /api/negocio]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
