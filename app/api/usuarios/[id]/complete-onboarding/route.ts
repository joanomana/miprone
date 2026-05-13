import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Usuario from '@/models/Usuario'
import Negocio from '@/models/Negocio'
import { enviarEmailBienvenida } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    // Only allow updating own profile
    if (session.user.id !== params.id) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    await connectDB()
    await Usuario.findByIdAndUpdate(params.id, { onboardingCompleto: true })

    // Enviar email de bienvenida en background (no bloquear respuesta)
    try {
      const usuario = await Usuario.findById(params.id).select('name email')
      const negocio = await Negocio.findOne({ usuarioId: params.id })
      if (usuario && negocio) {
        enviarEmailBienvenida(usuario.email, usuario.name, negocio.nombreFinca).catch(console.error)
      }
    } catch { /* no bloquear */ }

    return NextResponse.json({ success: true, message: 'Onboarding completado' })
  } catch (error) {
    console.error('[POST /api/usuarios/[id]/complete-onboarding]', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
