'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Bell } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/calculator': 'Calculadora & Catálogo',
  '/sales': 'Registro de Ventas',
  '/settings': 'Configuración',
}

interface Props {
  user: User
  profile: Profile | null
}

export default function AppHeader({ profile }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const title =
    Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ??
    '3D Printer Sheet'

  const isRober = profile?.role === 'Rober'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className="flex items-center justify-between px-4 md:px-6 py-3.5 border-b sticky top-0 z-40"
      style={{
        background: 'rgba(3, 7, 18, 0.9)',
        borderColor: 'rgba(55, 65, 81, 0.4)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        <p className="text-xs text-gray-500 hidden sm:block">
          {new Date().toLocaleDateString('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Badge usuario */}
        <span
          className="badge hidden sm:inline-flex"
          style={{
            background: isRober ? 'rgba(124,58,237,0.2)' : 'rgba(16,185,129,0.2)',
            color: isRober ? '#a78bfa' : '#6ee7b7',
            border: `1px solid ${isRober ? 'rgba(124,58,237,0.3)' : 'rgba(16,185,129,0.3)'}`,
          }}
        >
          {profile?.display_name ?? 'Usuario'}
        </span>

        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          aria-label="Notificaciones"
        >
          <Bell className="w-4.5 h-4.5" />
        </button>

        <button
          id="logout-btn"
          onClick={handleLogout}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-950/50 transition-all"
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  )
}
