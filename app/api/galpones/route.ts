import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Galpon from '@/models/Galpon'
import { galponSchema } from '@/lib/validations/galpon'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()

    const parsed = galponSchema.safeParse(body)
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: errors },
        { status: 400 }
      )
    }

    await connectDB()

    const galpon = await Galpon.create({
      ...parsed.data,
      negocioId: session.user.negocioId,
      usuarioId: session.user.id,
    })

    return NextResponse.json(
      { success: true, galponId: galpon._id.toString(), data: galpon },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/galpones]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    await connectDB()
    const galpones = await Galpon.find({ usuarioId: session.user.id, activo: true }).sort({
      createdAt: 1,
    })

    return NextResponse.json({ success: true, data: galpones })
  } catch (error) {
    console.error('[GET /api/galpones]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
