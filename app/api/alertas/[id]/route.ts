import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Alerta from '@/models/Alerta'

// PATCH /api/alertas/[id] → marcar alerta individual como leída
export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    await connectDB()

    const alerta = await Alerta.findOneAndUpdate(
      { _id: params.id, usuarioId: session.user.id },
      { leida: true },
      { new: true }
    )

    if (!alerta) {
      return NextResponse.json({ success: false, error: 'Alerta no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: alerta })
  } catch (error) {
    console.error('[PATCH /api/alertas/[id]]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/alertas/[id] → eliminar alerta
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    await connectDB()

    const alerta = await Alerta.findOneAndDelete({ _id: params.id, usuarioId: session.user.id })

    if (!alerta) {
      return NextResponse.json({ success: false, error: 'Alerta no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Alerta eliminada' })
  } catch (error) {
    console.error('[DELETE /api/alertas/[id]]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
