'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Printer, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-gray-950">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Card login */}
      <div className="glass-card p-8 w-full max-w-md z-10 animate-fade-in">
        {/* Logo / Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-glow"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
            }}
          >
            <Printer className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">3D Printer Sheet</h1>
            <p className="text-gray-400 text-sm mt-1">
              Gestión de impresión 3D · Rober & Cris
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingLeft: '2.25rem', paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-950/60 border border-red-800/50 rounded-lg px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            id="login-submit"
            className="btn btn-primary btn-lg mt-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : null}
            {loading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>

        {/* Socios */}
        <div className="mt-6 pt-5 border-t border-gray-800 grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <span className="text-2xl">👨‍💻</span>
            <span className="text-xs font-semibold text-purple-300">Rober</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <span className="text-2xl">👩‍💼</span>
            <span className="text-xs font-semibold text-emerald-300">Cris</span>
          </div>
        </div>
      </div>
    </div>
  )
}
