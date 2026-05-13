import { create } from 'zustand'
import { IAlerta } from '@/types'

interface AlertasState {
  alertas: IAlerta[]
  alertasNoLeidas: number
  fetchAlertas: () => Promise<void>
  marcarLeida: (id: string) => Promise<void>
  marcarTodasLeidas: () => Promise<void>
}

export const useAlertasStore = create<AlertasState>((set, get) => ({
  alertas: [],
  alertasNoLeidas: 0,

  fetchAlertas: async () => {
    try {
      const res = await fetch('/api/alertas')
      if (!res.ok) return
      const data = await res.json()
      const alertas: IAlerta[] = data.data ?? []
      set({
        alertas,
        alertasNoLeidas: alertas.filter((a) => !a.leida).length,
      })
    } catch {
      // silent fail
    }
  },

  marcarLeida: async (id: string) => {
    try {
      const res = await fetch(`/api/alertas/${id}`, { method: 'PATCH' })
      if (!res.ok) return
      set((state) => {
        const alertas = state.alertas.map((a) =>
          a._id === id ? { ...a, leida: true } : a
        )
        return {
          alertas,
          alertasNoLeidas: alertas.filter((a) => !a.leida).length,
        }
      })
    } catch {
      // silent fail
    }
  },

  marcarTodasLeidas: async () => {
    try {
      const res = await fetch('/api/alertas', { method: 'PATCH' })
      if (!res.ok) return
      set((state) => ({
        alertas: state.alertas.map((a) => ({ ...a, leida: true })),
        alertasNoLeidas: 0,
      }))
    } catch {
      // silent fail
    }
  },
}))
