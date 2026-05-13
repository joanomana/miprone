'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import {
  User,
  Building2,
  Shield,
  Bell,
  LogOut,
  Save,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react'

interface NegocioData {
  nombreFinca: string
  departamento: string
  ciudad: string
  telefono: string
  direccion: string
}

interface PerfilForm {
  name: string
  telefono: string
}

interface PasswordForm {
  actual: string
  nueva: string
  confirmar: string
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50">
          <Icon size={16} className="text-green-600" />
        </div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled,
  suffix,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
  suffix?: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
        />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
    </div>
  )
}

export default function PerfilPage() {
  const { data: session, update } = useSession()

  const [perfilForm, setPerfilForm] = useState<PerfilForm>({ name: '', telefono: '' })
  const [savingPerfil, setSavingPerfil] = useState(false)
  const [perfilOk, setPerfilOk] = useState(false)
  const [perfilError, setPerfilError] = useState('')

  const [negocio, setNegocio] = useState<NegocioData>({
    nombreFinca: '',
    departamento: '',
    ciudad: '',
    telefono: '',
    direccion: '',
  })
  const [savingNegocio, setSavingNegocio] = useState(false)
  const [negocioOk, setNegocioOk] = useState(false)
  const [negocioError, setNegocioError] = useState('')

  const [passForm, setPassForm] = useState<PasswordForm>({ actual: '', nueva: '', confirmar: '' })
  const [showPass, setShowPass] = useState({ actual: false, nueva: false })
  const [savingPass, setSavingPass] = useState(false)
  const [passOk, setPassOk] = useState(false)
  const [passError, setPassError] = useState('')

  const [emailAlertas, setEmailAlertas] = useState(true)
  const [savingNotif, setSavingNotif] = useState(false)

  const isCredentials = true // mostrar cambio de contraseña para todos en este prototipo

  useEffect(() => {
    if (session?.user) {
      setPerfilForm({
        name: session.user.name ?? '',
        telefono: '',
      })
    }
  }, [session])

  useEffect(() => {
    fetch('/api/negocio')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setNegocio({
            nombreFinca: d.data.nombreFinca ?? '',
            departamento: d.data.departamento ?? '',
            ciudad: d.data.ciudad ?? '',
            telefono: d.data.telefono ?? '',
            direccion: d.data.direccion ?? '',
          })
        }
      })
      .catch(() => {})
  }, [])

  async function handleSavePerfil(e: React.FormEvent) {
    e.preventDefault()
    setPerfilError('')
    setPerfilOk(false)
    if (!perfilForm.name.trim()) return setPerfilError('El nombre es obligatorio.')
    setSavingPerfil(true)
    try {
      const res = await fetch(`/api/usuarios/${session?.user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: perfilForm.name, telefono: perfilForm.telefono }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error al guardar')
      await update({ name: perfilForm.name })
      setPerfilOk(true)
      setTimeout(() => setPerfilOk(false), 3000)
    } catch (err) {
      setPerfilError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSavingPerfil(false)
    }
  }

  async function handleSaveNegocio(e: React.FormEvent) {
    e.preventDefault()
    setNegocioError('')
    setNegocioOk(false)
    setSavingNegocio(true)
    try {
      const res = await fetch('/api/negocio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(negocio),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error al guardar')
      setNegocioOk(true)
      setTimeout(() => setNegocioOk(false), 3000)
    } catch (err) {
      setNegocioError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSavingNegocio(false)
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault()
    setPassError('')
    setPassOk(false)
    if (passForm.nueva !== passForm.confirmar) return setPassError('Las contraseñas no coinciden.')
    if (passForm.nueva.length < 8) return setPassError('Mínimo 8 caracteres.')
    setSavingPass(true)
    try {
      const res = await fetch(`/api/usuarios/${session?.user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordActual: passForm.actual, passwordNueva: passForm.nueva }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error')
      setPassOk(true)
      setPassForm({ actual: '', nueva: '', confirmar: '' })
      setTimeout(() => setPassOk(false), 3000)
    } catch (err) {
      setPassError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSavingPass(false)
    }
  }

  const initials = session?.user?.name
    ? session.user.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : 'U'

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-green-600 shadow-lg shadow-green-200">
            <User size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-sm text-gray-500">Configura tu cuenta y tu finca</p>
          </div>
        </div>

        {/* Perfil Card */}
        <SectionCard title="Mi Perfil" icon={User}>
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="avatar" className="w-16 h-16 object-cover" />
              ) : (
                <span className="text-white text-2xl font-bold">{initials}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{session?.user?.name}</p>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {session?.user?.image ? 'Google' : 'Email / Contraseña'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSavePerfil} className="space-y-4">
            {perfilError && (
              <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700 border border-red-100">{perfilError}</div>
            )}
            {perfilOk && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm text-green-700 border border-green-100">
                <CheckCircle size={15} /> Perfil actualizado
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Nombre completo"
                value={perfilForm.name}
                onChange={(v) => setPerfilForm({ ...perfilForm, name: v })}
                placeholder="Tu nombre"
              />
              <InputField
                label="Teléfono"
                value={perfilForm.telefono}
                onChange={(v) => setPerfilForm({ ...perfilForm, telefono: v })}
                placeholder="+57 300 000 0000"
              />
            </div>
            <InputField
              label="Correo electrónico"
              value={session?.user?.email ?? ''}
              disabled
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingPerfil}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {savingPerfil ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Guardar cambios
              </button>
            </div>
          </form>
        </SectionCard>

        {/* Mi Finca */}
        <SectionCard title="Mi Finca" icon={Building2}>
          <form onSubmit={handleSaveNegocio} className="space-y-4">
            {negocioError && (
              <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700 border border-red-100">{negocioError}</div>
            )}
            {negocioOk && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm text-green-700 border border-green-100">
                <CheckCircle size={15} /> Datos de finca actualizados
              </div>
            )}
            <InputField
              label="Nombre de la finca"
              value={negocio.nombreFinca}
              onChange={(v) => setNegocio({ ...negocio, nombreFinca: v })}
              placeholder="Nombre de tu finca"
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Departamento"
                value={negocio.departamento}
                onChange={(v) => setNegocio({ ...negocio, departamento: v })}
                placeholder="Departamento"
              />
              <InputField
                label="Ciudad"
                value={negocio.ciudad}
                onChange={(v) => setNegocio({ ...negocio, ciudad: v })}
                placeholder="Ciudad"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Teléfono"
                value={negocio.telefono}
                onChange={(v) => setNegocio({ ...negocio, telefono: v })}
                placeholder="+57 300 000 0000"
              />
              <InputField
                label="Dirección"
                value={negocio.direccion}
                onChange={(v) => setNegocio({ ...negocio, direccion: v })}
                placeholder="Dirección (opcional)"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingNegocio}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {savingNegocio ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Guardar finca
              </button>
            </div>
          </form>
        </SectionCard>

        {/* Seguridad */}
        {isCredentials && (
          <SectionCard title="Seguridad" icon={Shield}>
            {session?.user?.image ? (
              <p className="text-sm text-gray-500">
                Iniciaste sesión con Google. No puedes cambiar la contraseña desde aquí.
              </p>
            ) : (
              <form onSubmit={handleSavePassword} className="space-y-4">
                {passError && (
                  <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700 border border-red-100">{passError}</div>
                )}
                {passOk && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm text-green-700 border border-green-100">
                    <CheckCircle size={15} /> Contraseña actualizada
                  </div>
                )}
                <InputField
                  label="Contraseña actual"
                  type={showPass.actual ? 'text' : 'password'}
                  value={passForm.actual}
                  onChange={(v) => setPassForm({ ...passForm, actual: v })}
                  placeholder="••••••••"
                  suffix={
                    <button type="button" onClick={() => setShowPass((s) => ({ ...s, actual: !s.actual }))}>
                      {showPass.actual ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
                    </button>
                  }
                />
                <InputField
                  label="Nueva contraseña"
                  type={showPass.nueva ? 'text' : 'password'}
                  value={passForm.nueva}
                  onChange={(v) => setPassForm({ ...passForm, nueva: v })}
                  placeholder="Mínimo 8 caracteres"
                  suffix={
                    <button type="button" onClick={() => setShowPass((s) => ({ ...s, nueva: !s.nueva }))}>
                      {showPass.nueva ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
                    </button>
                  }
                />
                <InputField
                  label="Confirmar nueva contraseña"
                  type="password"
                  value={passForm.confirmar}
                  onChange={(v) => setPassForm({ ...passForm, confirmar: v })}
                  placeholder="Repite la nueva contraseña"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPass}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
                  >
                    {savingPass ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                    Cambiar contraseña
                  </button>
                </div>
              </form>
            )}
          </SectionCard>
        )}

        {/* Notificaciones */}
        <SectionCard title="Notificaciones" icon={Bell}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Alertas críticas por correo</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Recibe un email cuando se detecte mortalidad alta o baja producción crítica
              </p>
            </div>
            <button
              onClick={async () => {
                const prev = emailAlertas
                setEmailAlertas(!prev)
                setSavingNotif(true)
                try {
                  await fetch(`/api/usuarios/${session?.user?.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ preferencias: { emailAlertas: !prev } }),
                  })
                } catch {
                  setEmailAlertas(prev)
                } finally {
                  setSavingNotif(false)
                }
              }}
              disabled={savingNotif}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailAlertas ? 'bg-green-600' : 'bg-gray-200'
              } disabled:opacity-60`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  emailAlertas ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </SectionCard>

        {/* Cerrar sesión */}
        <div className="pb-4">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
