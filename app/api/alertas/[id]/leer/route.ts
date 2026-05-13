import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Alerta from '@/models/Alerta'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await connectDB()

    const alerta = await Alerta.findOneAndUpdate(
      { _id: params.id, usuarioId: session.user.id },
      { leida: true },
      { new: true }
    )

    if (!alerta) {
      return NextResponse.json({ error: 'Alerta no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: alerta })
  } catch (error) {
    console.error('[POST /api/alertas/[id]/leer]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
