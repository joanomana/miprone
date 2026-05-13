'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Building2,
  Package,
  Wheat,
  DollarSign,
  BarChart3,
  Bell,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useAlertasStore } from '@/store/useAlertasStore'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Galpones', icon: Building2, href: '/galpones' },
  { label: 'Producción', icon: Package, href: '/produccion' },
  { label: 'Alimento', icon: Wheat, href: '/alimento' },
  { label: 'Costos', icon: DollarSign, href: '/costos' },
  { label: 'Reportes', icon: BarChart3, href: '/reportes' },
  { label: 'Alertas', icon: Bell, href: '/alertas', badge: true },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const alertasNoLeidas = useAlertasStore((s) => s.alertasNoLeidas)

  const initials = session?.user?.name
    ? session.user.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col" style={{ backgroundColor: '#1a2e1a' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-600">
          {/* Galpón SVG */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z" fill="white" fillOpacity="0.9"/>
            <path d="M9 21V15H15V21" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M3 9.5L12 3L21 9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <span className="text-white font-bold text-xl tracking-tight">MiProne</span>
          <p className="text-green-400 text-[10px] font-medium tracking-widest uppercase">Gestión Avícola</p>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
          <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <span className="text-white text-sm font-semibold">{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{session?.user?.name ?? 'Usuario'}</p>
            <p className="text-green-400 text-xs truncate">Mi Finca</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">Menú principal</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-green-600/20 text-white border-l-[3px] border-green-400'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`}
              style={isActive ? { paddingLeft: '9px' } : {}}
            >
              <Icon
                size={18}
                className={`flex-shrink-0 transition-colors ${
                  isActive ? 'text-green-400' : 'text-white/50 group-hover:text-white/80'
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && alertasNoLeidas > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {alertasNoLeidas > 99 ? '99+' : alertasNoLeidas}
                </span>
              )}
              {isActive && (
                <ChevronRight size={14} className="text-green-400 opacity-60" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/perfil"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname === '/perfil'
              ? 'bg-green-600/20 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/8'
          }`}
        >
          <User size={18} className="flex-shrink-0 text-white/50" />
          <span>Perfil</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
