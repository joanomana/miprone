import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import RegistroProduccion from '@/models/RegistroProduccion'
import Galpon from '@/models/Galpon'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const galponId = searchParams.get('galponId')
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')
    const limit = parseInt(searchParams.get('limit') ?? '100')

    await connectDB()

    // Build query filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { usuarioId: session.user.id }
    if (galponId) filter.galponId = galponId

    const fechaFilter: Record<string, Date> = {}
    if (desde) fechaFilter.$gte = new Date(desde)
    if (hasta) fechaFilter.$lte = new Date(hasta)
    if (Object.keys(fechaFilter).length > 0) filter.fecha = fechaFilter

    const registros = await RegistroProduccion.find(filter)
      .sort({ fecha: -1, createdAt: -1 })
      .limit(limit)
      .lean()

    // Compute stats
    const totalHuevos = registros.reduce((sum, r) => sum + r.cantidadHuevos, 0)
    const totalMortalidad = registros.reduce((sum, r) => sum + r.mortalidad, 0)

    // Group by date to compute daily averages and trend
    const byDate: Record<string, number> = {}
    for (const r of registros) {
      const dateKey = new Date(r.fecha).toISOString().split('T')[0]
      byDate[dateKey] = (byDate[dateKey] ?? 0) + r.cantidadHuevos
    }

    const sortedDays = Object.keys(byDate).sort()
    const promediosDia = sortedDays.map((d) => byDate[d])
    const promedioDiario = promediosDia.length > 0 ? Math.round(totalHuevos / promediosDia.length) : 0

    let tendencia: 'sube' | 'baja' | 'estable' = 'estable'
    if (promediosDia.length >= 2) {
      const last = promediosDia[promediosDia.length - 1]
      const prev = promediosDia[promediosDia.length - 2]
      const diff = ((last - prev) / (prev || 1)) * 100
      if (diff > 5) tendencia = 'sube'
      else if (diff < -5) tendencia = 'baja'
    }

    // Build chart data: [{fecha, huevos}]
    const chartData = sortedDays.reverse().slice(0, 7).reverse().map((fecha) => ({
      fecha,
      huevos: byDate[fecha],
    }))

    return NextResponse.json({
      success: true,
      data: {
        registros,
        stats: {
          totalPeriodo: totalHuevos,
          totalMortalidad,
          promedioDiario,
          tendencia,
          diasConRegistro: sortedDays.length,
        },
        chartData,
      },
    })
  } catch (error) {
    console.error('[GET /api/produccion]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()

    await connectDB()

    // Verify the galpon belongs to user
    const galpon = await Galpon.findOne({ _id: body.galponId, usuarioId: session.user.id })
    if (!galpon) {
      return NextResponse.json({ success: false, error: 'Galpón no encontrado' }, { status: 404 })
    }

    const registro = await RegistroProduccion.create({
      ...body,
      usuarioId: session.user.id,
      registradoPor: session.user.name ?? session.user.email ?? 'Usuario',
    })

    return NextResponse.json({ success: true, data: registro }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/produccion]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
