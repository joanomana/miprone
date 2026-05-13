import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Galpon from '@/models/Galpon'
import RegistroAlimento from '@/models/RegistroAlimento'
import { registroAlimentoSchema } from '@/lib/validations/alimento'
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
      RegistroAlimento.find({ galponId: id })
        .sort({ fecha: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RegistroAlimento.countDocuments({ galponId: id }),
    ])

    // Inventario actual: último registro
    const ultimoRegistro = await RegistroAlimento.findOne(
      { galponId: id },
      {},
      { sort: { fecha: -1, createdAt: -1 } }
    )
    const inventarioActual = ultimoRegistro?.inventarioRestante ?? 0

    // Consumo esta semana
    const hace7Dias = new Date()
    hace7Dias.setDate(hace7Dias.getDate() - 7)
    const registros7Dias = await RegistroAlimento.find({
      galponId: id,
      fecha: { $gte: hace7Dias },
    })
    const consumoSemana = registros7Dias.reduce((s, r) => s + r.cantidadKg, 0)
    const costoSemana = registros7Dias.reduce((s, r) => s + r.costoTotal, 0)

    // Consumo diario estimado (últimos 30 días)
    const hace30Dias = new Date()
    hace30Dias.setDate(hace30Dias.getDate() - 30)
    const registros30Dias = await RegistroAlimento.find({
      galponId: id,
      fecha: { $gte: hace30Dias },
    })
    const consumo30 = registros30Dias.reduce((s, r) => s + r.cantidadKg, 0)
    const consumoDiarioEstimado = consumo30 / 30

    // Chart data
    const chartMap: Record<string, { kg: number; costo: number }> = {}
    for (const r of registros30Dias) {
      const key = new Date(r.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
      if (!chartMap[key]) chartMap[key] = { kg: 0, costo: 0 }
      chartMap[key].kg += r.cantidadKg
      chartMap[key].costo += r.costoTotal
    }
    const chartData = Object.entries(chartMap).map(([fecha, v]) => ({ fecha, ...v }))

    return NextResponse.json({
      success: true,
      data: {
        registros,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        inventarioActual,
        consumoDiarioEstimado,
        stats: {
          inventarioActual,
          consumoSemana,
          costoSemana,
          consumoDiarioEstimado,
        },
        chartData,
      },
    })
  } catch (error) {
    console.error('[GET /api/galpones/[id]/alimento]', error)
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

    const parsed = registroAlimentoSchema.safeParse({ ...body, galponId: id })
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

    // Calcular inventario acumulado: último registro + nueva cantidad
    const ultimoRegistro = await RegistroAlimento.findOne(
      { galponId: id },
      {},
      { sort: { fecha: -1, createdAt: -1 } }
    )
    const inventarioAnterior = ultimoRegistro?.inventarioRestante ?? 0
    const inventarioRestante = inventarioAnterior + parsed.data.cantidadKg
    const costoTotal = parsed.data.cantidadKg * parsed.data.costoUnitario

    const registro = await RegistroAlimento.create({
      ...parsed.data,
      galponId: id,
      usuarioId: session.user.id,
      costoTotal,
      inventarioRestante,
    })

    // Evaluar alertas en background
    evaluarAlertas(id, session.user.id).catch(console.error)

    return NextResponse.json({ success: true, data: registro }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/galpones/[id]/alimento]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
