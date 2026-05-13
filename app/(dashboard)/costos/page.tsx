'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { DollarSign, Plus, X, Loader2, Egg, Wheat, Briefcase } from 'lucide-react'
import { ICosto, CategoríaCosto } from '@/types'
import InfoPanel from '@/components/shared/InfoPanel'

const CATEGORIA_LABELS: Record<CategoríaCosto, string> = {
  alimento: 'Alimento',
  medicamento: 'Medicamento',
  mano_obra: 'Mano de obra',
  servicios: 'Servicios',
  otro: 'Otro',
}

const CATEGORIA_COLORS: Record<CategoríaCosto, string> = {
  alimento: '#16a34a',
  medicamento: '#3b82f6',
  mano_obra: '#f59e0b',
  servicios: '#8b5cf6',
  otro: '#6b7280',
}

const CATEGORIA_BADGE: Record<CategoríaCosto, string> = {
  alimento: 'bg-green-100 text-green-700',
  medicamento: 'bg-blue-100 text-blue-700',
  mano_obra: 'bg-amber-100 text-amber-700',
  servicios: 'bg-purple-100 text-purple-700',
  otro: 'bg-gray-100 text-gray-700',
}

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n)
}

function formatFecha(d: Date | string) {
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(d)
  )
}

interface FormData {
  descripcion: string
  categoria: CategoríaCosto
  monto: string
  galponId: string
  fecha: string
}

const emptyForm: FormData = {
  descripcion: '',
  categoria: 'alimento',
  monto: '',
  galponId: '',
  fecha: new Date().toISOString().split('T')[0],
}

export default function CostosPage() {
  const [costos, setCostos] = useState<ICosto[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [galpones, setGalpones] = useState<{ _id: string; nombre: string }[]>([])

  const fetchCostos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/costos')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCostos(data.data ?? [])
    } catch {
      // silencioso
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCostos()
    fetch('/api/galpones')
      .then((r) => r.json())
      .then((d) => setGalpones(d.data ?? []))
      .catch(() => {})
  }, [fetchCostos])

  // KPIs
  const now = new Date()
  const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1)
  const costosMes = costos.filter((c) => new Date(c.fecha) >= primerDiaMes)
  const totalMes = costosMes.reduce((s, c) => s + c.monto, 0)
  const costoAlimento = costosMes.filter((c) => c.categoria === 'alimento').reduce((s, c) => s + c.monto, 0)
  const otrosCostos = totalMes - costoAlimento

  // Pie data
  const pieData = Object.entries(CATEGORIA_LABELS).map(([key, label]) => ({
    name: label,
    value: costos.filter((c) => c.categoria === key).reduce((s, c) => s + c.monto, 0),
    color: CATEGORIA_COLORS[key as CategoríaCosto],
  })).filter((d) => d.value > 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!form.descripcion.trim()) return setFormError('La descripción es obligatoria.')
    if (!form.monto || Number(form.monto) <= 0) return setFormError('El monto debe ser mayor a 0.')
    setSaving(true)
    try {
      const res = await fetch('/api/costos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          monto: Number(form.monto),
          galponId: form.galponId || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al guardar')
      }
      await fetchCostos()
      setModal(false)
      setForm(emptyForm)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-green-600 shadow-lg shadow-green-200">
              <DollarSign size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Costos</h1>
              <p className="text-sm text-gray-500">Registra y controla tus gastos operativos</p>
            </div>
          </div>
          <button
            onClick={() => { setModal(true); setForm(emptyForm); setFormError('') }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Registrar Costo
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Costo total mes', value: formatCOP(totalMes), icon: DollarSign, color: 'bg-green-600', sub: 'mes actual' },
            { title: 'Costo alimento', value: formatCOP(costoAlimento), icon: Wheat, color: 'bg-amber-500', sub: 'mes actual' },
            { title: 'Otros costos', value: formatCOP(otrosCostos), icon: Briefcase, color: 'bg-blue-500', sub: 'mes actual' },
            { title: 'Total registros', value: costos.length.toString(), icon: Egg, color: 'bg-purple-500', sub: 'histórico' },
          ].map((kpi) => (
            <div key={kpi.title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${kpi.color}`}>
                  <kpi.icon size={17} className="text-white" />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900 truncate">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Tabla */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Historial de Costos</h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="text-green-500 animate-spin" />
              </div>
            ) : costos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <DollarSign size={40} className="text-gray-200 mb-3" />
                <p className="text-gray-500 font-medium">Sin costos registrados</p>
                <p className="text-sm text-gray-400 mt-1">Registra tu primer gasto operativo</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripción</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {costos.slice(0, 50).map((c) => (
                      <tr key={c._id.toString()} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatFecha(c.fecha)}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{c.descripcion}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORIA_BADGE[c.categoria]}`}>
                            {CATEGORIA_LABELS[c.categoria]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCOP(c.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pie chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Distribución</h2>
              <p className="text-xs text-gray-500 mt-0.5">Por categoría (todo el historial)</p>
            </div>
            <div className="p-4">
              {pieData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-gray-400">Sin datos para mostrar</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', fontSize: 12 }}
                        formatter={(v) => [formatCOP(Number(v)), 'Total']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {pieData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-gray-600">{d.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">{formatCOP(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <InfoPanel
          title="Gestión de Costos"
          description="Registra y categoriza todos los gastos operativos de tu granja para tener visibilidad completa de la rentabilidad del negocio."
          userStory="Como productor, quiero registrar mis costos operativos para conocer la rentabilidad real de mi producción avícola."
          tip="Clasifica cada gasto en la categoría correcta para obtener reportes precisos y detectar dónde se concentran tus mayores egresos."
        />
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Registrar Costo</h2>
              <button
                onClick={() => setModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700 border border-red-100">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Ej: Compra de alimento concentrado"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value as CategoríaCosto })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {Object.entries(CATEGORIA_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Monto (COP)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.monto}
                    onChange={(e) => setForm({ ...form, monto: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Galpón (opcional)</label>
                  <select
                    value={form.galponId}
                    onChange={(e) => setForm({ ...form, galponId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Todos</option>
                    {galpones.map((g) => (
                      <option key={g._id} value={g._id}>{g.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha</label>
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
