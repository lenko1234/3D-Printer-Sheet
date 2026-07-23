'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calculator, ShoppingCart, Settings } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calculator', label: 'Calculadora', icon: Calculator },
  { href: '/sales', label: 'Ventas', icon: ShoppingCart },
  { href: '/settings', label: 'Config', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: 'rgba(3, 7, 18, 0.95)',
        borderTop: '1px solid rgba(55, 65, 81, 0.5)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
              style={{
                color: active ? '#818cf8' : '#6b7280',
                background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
              }}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.75} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
