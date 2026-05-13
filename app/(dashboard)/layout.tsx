'use client'

import { useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { useAlertasStore } from '@/store/useAlertasStore'
import { useUIStore } from '@/store/useUIStore'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const fetchAlertas = useAlertasStore((s) => s.fetchAlertas)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  useEffect(() => {
    fetchAlertas()
    // Re-fetch alertas every 5 minutes
    const interval = setInterval(fetchAlertas, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchAlertas])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={toggleSidebar}
          />
          <div className="fixed inset-y-0 left-0 z-40 w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
