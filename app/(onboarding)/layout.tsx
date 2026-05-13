import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MiProne — Configura tu granja',
  description: 'Configura tu negocio avícola en minutos',
}

interface OnboardingLayoutProps {
  children: React.ReactNode
  // We use a URL-based approach to determine step, so we pass it via children pattern
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-10">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-green-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 11l9-7 9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1V11z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold text-green-800">MiProne</span>
            <p className="text-xs text-green-600 -mt-0.5">Mi Producción, Mi Negocio</p>
          </div>
        </div>

        {/* Step indicator is rendered by each page directly to know which step is active */}
        {children}
      </div>
    </div>
  )
}
