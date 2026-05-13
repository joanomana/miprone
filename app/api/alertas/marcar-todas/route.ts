import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Alerta from '@/models/Alerta'

export async function PATCH() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await connectDB()

    await Alerta.updateMany(
      { usuarioId: session.user.id, leida: false },
      { leida: true }
    )

    return NextResponse.json({ success: true, message: 'Todas las alertas marcadas como leídas' })
  } catch (error) {
    console.error('[PATCH /api/alertas/marcar-todas]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
