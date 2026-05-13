import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Usuario from '@/models/Usuario'
import bcrypt from 'bcryptjs'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.id !== params.id) {
      return NextResponse.json({ error: 'Prohibido' }, { status: 403 })
    }

    await connectDB()
    const usuario = await Usuario.findById(params.id).select('-password').lean()
    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: usuario })
  } catch (error) {
    console.error('[GET /api/usuarios/[id]]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.id !== params.id) {
      return NextResponse.json({ error: 'Prohibido' }, { status: 403 })
    }

    const body = await request.json()
    const allowedFields: Record<string, unknown> = {}
    if (body.name !== undefined) allowedFields.name = String(body.name).trim()
    if (body.image !== undefined) allowedFields.image = body.image
    if (body.telefono !== undefined) allowedFields.telefono = body.telefono
    if (body.preferencias !== undefined) allowedFields.preferencias = body.preferencias

    await connectDB()
    const usuario = await Usuario.findByIdAndUpdate(
      params.id,
      { $set: allowedFields },
      { new: true }
    ).select('-password').lean()

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: usuario })
  } catch (error) {
    console.error('[PUT /api/usuarios/[id]]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.id !== params.id) {
      return NextResponse.json({ error: 'Prohibido' }, { status: 403 })
    }

    const { passwordActual, passwordNueva } = await request.json()
    if (!passwordActual || !passwordNueva) {
      return NextResponse.json({ error: 'Se requieren ambas contraseñas' }, { status: 400 })
    }

    await connectDB()
    const usuario = await Usuario.findById(params.id).select('+password')
    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }
    if (usuario.provider !== 'credentials') {
      return NextResponse.json(
        { error: 'Los usuarios de Google no pueden cambiar la contraseña' },
        { status: 400 }
      )
    }
    if (!usuario.password) {
      return NextResponse.json({ error: 'No hay contraseña configurada' }, { status: 400 })
    }

    const valida = await bcrypt.compare(passwordActual, usuario.password)
    if (!valida) {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 })
    }

    const hash = await bcrypt.hash(passwordNueva, 12)
    await Usuario.findByIdAndUpdate(params.id, { password: hash })

    return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    console.error('[PATCH /api/usuarios/[id]/password]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
