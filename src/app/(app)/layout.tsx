import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppSidebar from '@/components/layout/AppSidebar'
import BottomNav from '@/components/layout/BottomNav'
import AppHeader from '@/components/layout/AppHeader'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-dvh bg-gray-950">
      {/* Sidebar desktop */}
      <AppSidebar user={user} profile={profile} />

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <AppHeader user={user} profile={profile} />
        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Bottom nav mobile */}
      <BottomNav />
    </div>
  )
}
