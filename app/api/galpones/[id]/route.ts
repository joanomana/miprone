import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Galpon from '@/models/Galpon'
import RegistroProduccion from '@/models/RegistroProduccion'
import { galponSchema } from '@/lib/validations/galpon'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    const galpon = await Galpon.findOne({ _id: id, usuarioId: session.user.id })
    if (!galpon) {
      return NextResponse.json({ success: false, error: 'Galpón no encontrado' }, { status: 404 })
    }

    // Stats básicas
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const registrosHoy = await RegistroProduccion.find({
      galponId: id,
      fecha: { $gte: today },
    })

    const huevosHoy = registrosHoy.reduce((s, r) => s + r.cantidadHuevos, 0)

    const todosRegistros = await RegistroProduccion.find({ galponId: id })
    const mortalidadAcumulada = todosRegistros.reduce((s, r) => s + r.mortalidad, 0)
    const gallinasActivas = Math.max(0, galpon.cantidadGallinas - mortalidadAcumulada)

    const porcentajePosicion =
      gallinasActivas > 0 ? (huevosHoy / gallinasActivas) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        galpon,
        stats: {
          huevosHoy,
          mortalidadAcumulada,
          gallinasActivas,
          porcentajePosicion: Math.min(porcentajePosicion, 100),
        },
      },
    })
  } catch (error) {
    console.error('[GET /api/galpones/[id]]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const parsed = galponSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const galpon = await Galpon.findOneAndUpdate(
      { _id: id, usuarioId: session.user.id },
      { $set: parsed.data },
      { new: true }
    )

    if (!galpon) {
      return NextResponse.json({ success: false, error: 'Galpón no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: galpon })
  } catch (error) {
    console.error('[PUT /api/galpones/[id]]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    const galpon = await Galpon.findOneAndUpdate(
      { _id: id, usuarioId: session.user.id },
      { $set: { activo: false } },
      { new: true }
    )

    if (!galpon) {
      return NextResponse.json({ success: false, error: 'Galpón no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Galpón desactivado exitosamente' })
  } catch (error) {
    console.error('[DELETE /api/galpones/[id]]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
