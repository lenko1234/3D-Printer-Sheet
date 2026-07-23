'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calculator,
  ShoppingCart,
  Settings,
  Printer,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calculator', label: 'Calculadora', icon: Calculator },
  { href: '/sales', label: 'Ventas', icon: ShoppingCart },
  { href: '/settings', label: 'Configuración', icon: Settings },
]

interface Props {
  user: User
  profile: Profile | null
}

export default function AppSidebar({ profile }: Props) {
  const pathname = usePathname()
  const isRober = profile?.role === 'Rober'

  return (
    <aside
      className="hidden md:flex flex-col w-60 min-h-dvh border-r"
      style={{
        background: 'rgba(17, 24, 39, 0.8)',
        borderColor: 'rgba(55, 65, 81, 0.5)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'rgba(55,65,81,0.5)' }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
        >
          <Printer className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">3D Printer</p>
          <p className="text-gray-500 text-xs">Sheet v1.0</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium"
              style={{
                color: active ? '#a78bfa' : '#9ca3af',
                background: active
                  ? 'rgba(124, 58, 237, 0.15)'
                  : 'transparent',
                border: active
                  ? '1px solid rgba(124, 58, 237, 0.25)'
                  : '1px solid transparent',
              }}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={active ? 2.5 : 1.75} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Usuario */}
      <div className="px-3 pb-5 border-t pt-4" style={{ borderColor: 'rgba(55,65,81,0.5)' }}>
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{
            background: isRober
              ? 'rgba(124,58,237,0.1)'
              : 'rgba(16,185,129,0.1)',
            border: `1px solid ${isRober ? 'rgba(124,58,237,0.25)' : 'rgba(16,185,129,0.25)'}`,
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              background: isRober
                ? 'linear-gradient(135deg,#7c3aed,#a78bfa)'
                : 'linear-gradient(135deg,#10b981,#6ee7b7)',
            }}
          >
            {profile?.display_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: isRober ? '#a78bfa' : '#6ee7b7' }}
            >
              {profile?.display_name ?? 'Usuario'}
            </p>
            <p className="text-xs text-gray-500">
              {isRober ? 'Socio principal' : 'Socia'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
