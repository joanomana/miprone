import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Alerta from '@/models/Alerta'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const leidaParam = searchParams.get('leida')
    const limit = parseInt(searchParams.get('limit') ?? '50')

    await connectDB()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { usuarioId: session.user.id }
    if (leidaParam === 'true') filter.leida = true
    if (leidaParam === 'false') filter.leida = false

    const alertas = await Alerta.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: alertas,
      noLeidas: alertas.filter((a) => !a.leida).length,
    })
  } catch (error) {
    console.error('[GET /api/alertas]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PATCH /api/alertas → marcar todas como leídas
export async function PATCH() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    await connectDB()
    await Alerta.updateMany({ usuarioId: session.user.id, leida: false }, { leida: true })

    return NextResponse.json({ success: true, message: 'Todas las alertas marcadas como leídas' })
  } catch (error) {
    console.error('[PATCH /api/alertas]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
