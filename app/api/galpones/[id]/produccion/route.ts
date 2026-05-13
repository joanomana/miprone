import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Galpon from '@/models/Galpon'
import RegistroProduccion from '@/models/RegistroProduccion'
import { registroProduccionSchema } from '@/lib/validations/produccion'
import { evaluarAlertas } from '@/lib/alertas'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') ?? '50')
    const page = parseInt(searchParams.get('page') ?? '1')
    const skip = (page - 1) * limit

    await connectDB()

    const galpon = await Galpon.findOne({ _id: id, usuarioId: session.user.id })
    if (!galpon) {
      return NextResponse.json({ success: false, error: 'Galpón no encontrado' }, { status: 404 })
    }

    const [registros, total] = await Promise.all([
      RegistroProduccion.find({ galponId: id })
        .sort({ fecha: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RegistroProduccion.countDocuments({ galponId: id }),
    ])

    // Stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const hace30Dias = new Date(today)
    hace30Dias.setDate(hace30Dias.getDate() - 30)

    const registros30Dias = await RegistroProduccion.find({
      galponId: id,
      fecha: { $gte: hace30Dias },
    })

    const totalHoy = registros.filter((r) => new Date(r.fecha) >= today)
      .reduce((s, r) => s + r.cantidadHuevos, 0)

    const promedioSemanal =
      registros30Dias.length > 0
        ? registros30Dias.reduce((s, r) => s + r.cantidadHuevos, 0) / 30
        : 0

    const max30 = registros30Dias.length > 0
      ? Math.max(...registros30Dias.map((r) => r.cantidadHuevos))
      : 0

    const min30 = registros30Dias.length > 0
      ? Math.min(...registros30Dias.map((r) => r.cantidadHuevos))
      : 0

    const mortalidadAcumulada = (await RegistroProduccion.find({ galponId: id }))
      .reduce((s, r) => s + r.mortalidad, 0)

    const gallinasActivas = Math.max(0, galpon.cantidadGallinas - mortalidadAcumulada)
    const porcentajePosicion = gallinasActivas > 0 ? (totalHoy / gallinasActivas) * 100 : 0

    // Chart data: aggregate by day for last 30 days
    const chartMap: Record<string, number> = {}
    for (const r of registros30Dias) {
      const key = new Date(r.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
      chartMap[key] = (chartMap[key] ?? 0) + r.cantidadHuevos
    }
    const chartData = Object.entries(chartMap).map(([fecha, huevos]) => ({ fecha, huevos }))

    return NextResponse.json({
      success: true,
      data: {
        registros,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        stats: {
          totalHoy,
          promedioSemanal: Math.round(promedioSemanal),
          max30,
          min30,
          mortalidadAcumulada,
          gallinasActivas,
          porcentajePosicion: Math.min(porcentajePosicion, 100),
        },
        chartData,
      },
    })
  } catch (error) {
    console.error('[GET /api/galpones/[id]/produccion]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(
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

    const parsed = registroProduccionSchema.safeParse({ ...body, galponId: id })
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const galpon = await Galpon.findOne({ _id: id, usuarioId: session.user.id })
    if (!galpon) {
      return NextResponse.json({ success: false, error: 'Galpón no encontrado' }, { status: 404 })
    }

    const registro = await RegistroProduccion.create({
      ...parsed.data,
      galponId: id,
      usuarioId: session.user.id,
      registradoPor: session.user.name ?? session.user.email ?? 'Usuario',
    })

    // Evaluar alertas en background
    evaluarAlertas(id, session.user.id).catch(console.error)

    return NextResponse.json({ success: true, data: registro }, { status: 201 })
  } catch (error: unknown) {
    // Duplicate key: mismo turno en el mismo día
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un registro para este galpón, fecha y turno.' },
        { status: 409 }
      )
    }
    console.error('[POST /api/galpones/[id]/produccion]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
