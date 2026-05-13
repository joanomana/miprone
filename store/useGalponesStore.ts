import { create } from 'zustand'
import { IGalpon } from '@/types'

interface GalponesState {
  galpones: IGalpon[]
  galponActivo: IGalpon | null
  fetchGalpones: () => Promise<void>
  setGalponActivo: (id: string) => void
}

export const useGalponesStore = create<GalponesState>((set, get) => ({
  galpones: [],
  galponActivo: null,

  fetchGalpones: async () => {
    try {
      const res = await fetch('/api/galpones')
      if (!res.ok) return
      const data = await res.json()
      set({ galpones: data.data ?? [] })
    } catch {
      // silent fail
    }
  },

  setGalponActivo: (id: string) => {
    const galpon = get().galpones.find((g) => g._id === id) ?? null
    set({ galponActivo: galpon })
  },
}))
