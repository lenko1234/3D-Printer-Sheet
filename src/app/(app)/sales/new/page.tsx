import { createClient } from '@/lib/supabase/server'
import SaleForm from '@/components/sales/SaleForm'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Nueva Venta' }

export default async function NewSalePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user!.id).single()

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4 animate-fade-in">
      <Link
        href="/sales"
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al Historial
      </Link>
      <h1 className="text-xl font-bold text-white">Registrar Nueva Venta</h1>
      <Suspense fallback={<div className="glass-card p-10 text-center text-gray-500">Cargando formulario...</div>}>
        <SaleForm userProfile={profile} />
      </Suspense>
    </div>
  )
}
