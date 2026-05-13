'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Building2,
  Package,
  Bell,
  MoreHorizontal,
  Wheat,
  DollarSign,
  BarChart3,
  User,
  LogOut,
  X,
} from 'lucide-react'
import { useAlertasStore } from '@/store/useAlertasStore'

const mainItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Galpones', icon: Building2, href: '/galpones' },
  { label: 'Producción', icon: Package, href: '/produccion' },
  { label: 'Alertas', icon: Bell, href: '/alertas', badge: true },
]

const moreItems = [
  { label: 'Alimento', icon: Wheat, href: '/alimento' },
  { label: 'Costos', icon: DollarSign, href: '/costos' },
  { label: 'Reportes', icon: BarChart3, href: '/reportes' },
  { label: 'Perfil', icon: User, href: '/perfil' },
]

export default function MobileNav() {
  const pathname = usePathname()
  const alertasNoLeidas = useAlertasStore((s) => s.alertasNoLeidas)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 safe-area-pb">
        <div className="flex items-stretch h-16">
          {mainItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors ${
                  isActive ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div className="relative">
                  <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                  {item.badge && alertasNoLeidas > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[14px] h-3.5 px-1 rounded-full bg-red-500 text-white text-[8px] font-bold">
                      {alertasNoLeidas > 9 ? '9+' : alertasNoLeidas}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-green-500 rounded-b-full" />
                )}
              </Link>
            )
          })}

          {/* More button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-gray-400"
          >
            <MoreHorizontal size={21} strokeWidth={1.8} />
            <span className="text-[10px] font-medium">Más</span>
          </button>
        </div>
      </nav>

      {/* More Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl md:hidden pb-safe">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Más opciones</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {moreItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-colors ${
                      isActive
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'border-gray-100 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-green-600' : 'text-gray-400'} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
            <div className="px-4 pb-5">
              <button
                onClick={() => { setDrawerOpen(false); signOut({ callbackUrl: '/login' }) }}
                className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-500 text-sm font-medium"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
