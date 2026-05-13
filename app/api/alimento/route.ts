import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Galpon from '@/models/Galpon'
import RegistroAlimento from '@/models/RegistroAlimento'
import { registroAlimentoSchema } from '@/lib/validations/alimento'
import { evaluarAlertas } from '@/lib/alertas'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const galponId = searchParams.get('galponId')
    const limit = parseInt(searchParams.get('limit') ?? '50')
    const page = parseInt(searchParams.get('page') ?? '1')
    const skip = (page - 1) * limit

    await connectDB()

    const filter: Record<string, unknown> = { usuarioId: session.user.id }
    if (galponId) filter.galponId = galponId

    const [registros, total, galpones] = await Promise.all([
      RegistroAlimento.find(filter)
        .populate('galponId', 'nombre cantidadGallinas')
        .sort({ fecha: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RegistroAlimento.countDocuments(filter),
      Galpon.find({ usuarioId: session.user.id, activo: true }),
    ])

    // Inventario actual por galpón
    const inventarioPorGalpon: Record<string, { inventarioKg: number; consumoDiarioEstimado: number }> = {}

    for (const g of galpones) {
      const gId = g._id.toString()
      const ultimo = await RegistroAlimento.findOne(
        { galponId: gId },
        {},
        { sort: { fecha: -1, createdAt: -1 } }
      )
      const inventarioKg = ultimo?.inventarioRestante ?? 0

      const hace30Dias = new Date()
      hace30Dias.setDate(hace30Dias.getDate() - 30)
      const registros30 = await RegistroAlimento.find({
        galponId: gId,
        fecha: { $gte: hace30Dias },
      })
      const consumo30 = registros30.reduce((s, r) => s + r.cantidadKg, 0)
      const consumoDiarioEstimado = consumo30 / 30

      inventarioPorGalpon[gId] = { inventarioKg, consumoDiarioEstimado }
    }

    return NextResponse.json({
      success: true,
      data: {
        registros,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        galpones,
        inventarioPorGalpon,
      },
    })
  } catch (error) {
    console.error('[GET /api/alimento]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const body = await req.json()

    const parsed = registroAlimentoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const galpon = await Galpon.findOne({
      _id: parsed.data.galponId,
      usuarioId: session.user.id,
    })
    if (!galpon) {
      return NextResponse.json({ success: false, error: 'Galpón no encontrado' }, { status: 404 })
    }

    const ultimoRegistro = await RegistroAlimento.findOne(
      { galponId: parsed.data.galponId },
      {},
      { sort: { fecha: -1, createdAt: -1 } }
    )
    const inventarioAnterior = ultimoRegistro?.inventarioRestante ?? 0
    const inventarioRestante = inventarioAnterior + parsed.data.cantidadKg
    const costoTotal = parsed.data.cantidadKg * parsed.data.costoUnitario

    const registro = await RegistroAlimento.create({
      ...parsed.data,
      usuarioId: session.user.id,
      costoTotal,
      inventarioRestante,
    })

    evaluarAlertas(parsed.data.galponId, session.user.id).catch(console.error)

    return NextResponse.json({ success: true, data: registro }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/alimento]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
