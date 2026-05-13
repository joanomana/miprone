'use client'

import { toast } from 'sonner'
import { IAlerta } from '@/types'

export function mostrarAlertaToast(alerta: IAlerta): void {
  const mensaje = alerta.mensaje.length > 120
    ? alerta.mensaje.slice(0, 120) + '...'
    : alerta.mensaje

  const options = {
    description: mensaje,
    duration: 6000,
  }

  if (alerta.severidad === 'critical') {
    toast.error(alerta.titulo, options)
  } else if (alerta.severidad === 'warning') {
    toast.warning(alerta.titulo, options)
  } else {
    toast.info(alerta.titulo, options)
  }
}

// Re-export for convenience
export { toast }
