'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCheck, AlertCircle, CheckCircle } from 'lucide-react'
import { useAlertas } from '@/hooks/useAlertas'
import AlertaItem from '@/components/alertas/AlertaItem'
import { IAlerta } from '@/types'

type TabType = 'no-leidas' | 'todas' | 'criticas'

const ITEMS_PER_PAGE = 10

export default function AlertasPage() {
  const { alertas, alertasNoLeidas, marcarLeida, marcarTodasLeidas, refetch } = useAlertas()
  const [tab, setTab] = useState<TabType>('no-leidas')
  const [page, setPage] = useState(1)
  const [marcandoTodas, setMarcandoTodas] = useState(false)

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPage(1)
  }, [tab])

  const filtradas = alertas.filter((a: IAlerta) => {
    if (tab === 'no-leidas') return !a.leida
    if (tab === 'criticas') return a.severidad === 'critical'
    return true
  })

  const totalPages = Math.ceil(filtradas.length / ITEMS_PER_PAGE)
  const paginadas = filtradas.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  async function handleMarcarTodas() {
    setMarcandoTodas(true)
    await marcarTodasLeidas()
    setMarcandoTodas(false)
  }

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'no-leidas', label: 'No leídas', count: alertasNoLeidas },
    { id: 'todas', label: 'Todas', count: alertas.length },
    { id: 'criticas', label: 'Críticas', count: alertas.filter((a) => a.severidad === 'critical').length },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-green-600 shadow-lg shadow-green-200">
              <Bell size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Centro de Alertas</h1>
              <p className="text-sm text-gray-500">
                {alertasNoLeidas > 0
                  ? `${alertasNoLeidas} alerta${alertasNoLeidas !== 1 ? 's' : ''} sin leer`
                  : 'Estás al día'}
              </p>
            </div>
          </div>
          {alertasNoLeidas > 0 && (
            <button
              onClick={handleMarcarTodas}
              disabled={marcandoTodas}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              <CheckCheck size={16} />
              {marcandoTodas ? 'Marcando...' : 'Marcar todas como leídas'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === t.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      tab === t.id
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Lista */}
          <div className="p-4 space-y-3">
            {paginadas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {tab === 'no-leidas' ? '¡Sin alertas pendientes!' : 'Sin alertas en esta categoría'}
                </h3>
                <p className="text-sm text-gray-500">
                  {tab === 'no-leidas'
                    ? 'Todo en orden. No tienes alertas sin leer.'
                    : 'No hay alertas que mostrar aquí.'}
                </p>
              </div>
            ) : (
              paginadas.map((alerta) => (
                <AlertaItem
                  key={alerta._id.toString()}
                  alerta={alerta as IAlerta & { galponNombre?: string }}
                  onMarcarLeida={marcarLeida}
                />
              ))
            )}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Mostrando {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtradas.length)} de{' '}
                {filtradas.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${
                      p === page
                        ? 'bg-green-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Las alertas se generan automáticamente al detectar baja producción, mortalidad alta o inventario bajo.
            Las alertas críticas también se envían por correo si tienes las notificaciones activadas.
          </p>
        </div>
      </div>
    </div>
  )
}
