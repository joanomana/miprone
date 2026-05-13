'use client'

import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Menu, Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useUIStore } from '@/store/useUIStore'
import { useAlertasStore } from '@/store/useAlertasStore'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/galpones': 'Mis Galpones',
  '/produccion': 'Registro de Producción',
  '/alimento': 'Control de Alimento',
  '/costos': 'Gestión de Costos',
  '/reportes': 'Reportes',
  '/alertas': 'Alertas',
  '/perfil': 'Mi Perfil',
}

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  const base = '/' + pathname.split('/')[1]
  return pageTitles[base] ?? 'MiProne'
}

export default function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const alertasNoLeidas = useAlertasStore((s) => s.alertasNoLeidas)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()

  const initials = session?.user?.name
    ? session.user.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : 'U'

  const pageTitle = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-gray-100 shadow-sm">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors md:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 leading-tight">{pageTitle}</h1>
          <p className="text-xs text-gray-400 hidden sm:block">
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Right: bell + avatar */}
      <div className="flex items-center gap-2">
        {/* Bell */}
        <Link
          href="/alertas"
          className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Bell size={20} />
          {alertasNoLeidas > 0 && (
            <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
              {alertasNoLeidas > 9 ? '9+' : alertasNoLeidas}
            </span>
          )}
        </Link>

        {/* Avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center overflow-hidden">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="avatar" className="w-8 h-8 object-cover" />
              ) : (
                <span className="text-white text-xs font-semibold">{initials}</span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[120px] truncate">
              {session?.user?.name?.split(' ')[0] ?? 'Usuario'}
            </span>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
                </div>
                <button
                  onClick={() => { setDropdownOpen(false); router.push('/perfil') }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={15} className="text-gray-400" />
                  Mi Perfil
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); router.push('/configuracion') }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={15} className="text-gray-400" />
                  Configuración
                </button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: '/login' }) }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
