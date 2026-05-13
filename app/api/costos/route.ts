import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Costo from '@/models/Costo'
import Negocio from '@/models/Negocio'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')
    const categoria = searchParams.get('categoria')
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)

    await connectDB()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { usuarioId: session.user.id }

    if (desde || hasta) {
      query.fecha = {}
      if (desde) query.fecha.$gte = new Date(desde)
      if (hasta) query.fecha.$lte = new Date(hasta)
    }

    if (categoria) query.categoria = categoria

    const skip = (page - 1) * limit
    const [costos, total] = await Promise.all([
      Costo.find(query)
        .populate('galponId', 'nombre')
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Costo.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      data: costos,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('[GET /api/costos]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { descripcion, categoria, monto, galponId, fecha } = body

    if (!descripcion || !categoria || monto === undefined || !fecha) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    await connectDB()

    const negocio = await Negocio.findOne({ usuarioId: session.user.id })
    if (!negocio) {
      return NextResponse.json({ error: 'No tienes una finca registrada' }, { status: 400 })
    }

    const costo = await Costo.create({
      usuarioId: session.user.id,
      negocioId: negocio._id,
      galponId: galponId || undefined,
      descripcion,
      categoria,
      monto: Number(monto),
      fecha: new Date(fecha),
    })

    return NextResponse.json({ success: true, data: costo }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/costos]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
