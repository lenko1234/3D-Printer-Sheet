import { getMaterials, getProducts, getPublicSettings } from '@/lib/actions'
import { createClient } from '@/lib/supabase/server'
import CalculatorClient from '@/components/calculator/CalculatorClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Calculadora & Catálogo' }

export default async function CalculatorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user!.id).single()

  const [materials, products, settings] = await Promise.all([
    getMaterials(),
    getProducts(),
    getPublicSettings(),
  ])

  return (
    <CalculatorClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialMaterials={materials as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialProducts={products as any}
      settings={settings}
      userProfile={profile}
    />
  )
}
