import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MiProne — Accede a tu cuenta',
  description: 'Mi Producción, Mi Negocio',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-12">
      {/* Background decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-100 rounded-full opacity-30 blur-3xl" />
      </div>

      {/* Logo / Brand */}
      <div className="relative z-10 mb-8 flex flex-col items-center">
        {/* Galpón SVG Icon */}
        <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-9 h-9 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Barn / farm house */}
            <path d="M3 11l9-7 9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1V11z" />
            <polyline points="9 22 9 12 15 12 15 22" />
            {/* Egg shape on the side */}
            <ellipse cx="18.5" cy="7.5" rx="1.5" ry="2" fill="white" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-green-800 tracking-tight">MiProne</h1>
        <p className="text-sm text-green-600 font-medium mt-0.5">Mi Producción, Mi Negocio</p>
      </div>

      {/* Page content (card) */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-xs text-gray-400 text-center">
        © {new Date().getFullYear()} MiProne · UNAD Proyecto de Ingeniería II
      </p>
    </div>
  )
}
