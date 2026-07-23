'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateProfitShare } from '@/lib/calculations'
import type { SellerName, SettingsMap, DashboardStats, Sale } from '@/types/database'
import { revalidatePath } from 'next/cache'

// ============================================================
// HELPERS
// ============================================================

async function getSettings(): Promise<SettingsMap> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('settings').select('key, value')
  if (error) throw new Error(`Error obteniendo settings: ${error.message}`)

  const map: Record<string, number> = {}
  for (const row of data ?? []) {
    map[row.key] = Number(row.value)
  }

  return {
    electricity_per_hour: map.electricity_per_hour ?? 20,
    labor_per_piece: map.labor_per_piece ?? 300,
    machine_per_hour: map.machine_per_hour ?? 200,
    printer_total_cost: map.printer_total_cost ?? 350000,
    default_margin: map.default_margin ?? 0.4,
  }
}

// ============================================================
// REGISTRAR VENTA
// ============================================================

export interface RegisterSaleInput {
  sale_date: string
  customer_name: string
  seller_name: SellerName
  product_id?: string
  product_name: string
  sale_price: number
  total_cost: number
  cost_filament: number
  cost_electricity: number
  cost_machine: number
  cost_labor: number
  notes?: string
}

export async function registerSale(input: RegisterSaleInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('No autenticado')

  // Ganancia a repartir = Precio Venta - Costo Producción - Fondo Impresora
  const net_profit = input.sale_price - input.total_cost - input.cost_machine

  // Reparto de ganancia (fórmulas exactas del Excel)
  const share = calculateProfitShare(net_profit, input.seller_name)

  // El aporte al fondo impresora = costo_maquina de la pieza
  const machine_fund_contribution = input.cost_machine

  const { data, error } = await supabase
    .from('sales')
    .insert({
      sale_date: input.sale_date,
      customer_name: input.customer_name || null,
      seller_id: user.id,
      seller_name: input.seller_name,
      product_id: input.product_id || null,
      product_name: input.product_name,
      sale_price: input.sale_price,
      total_cost: input.total_cost,
      cost_filament: input.cost_filament,
      cost_electricity: input.cost_electricity,
      cost_machine: input.cost_machine,
      cost_labor: input.cost_labor,
      machine_fund_contribution,
      rober_share: share.rober,
      cris_share: share.cris,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (error) throw new Error(`Error registrando venta: ${error.message}`)

  revalidatePath('/dashboard')
  revalidatePath('/sales')

  return data
}

// ============================================================
// ESTADÍSTICAS PARA EL DASHBOARD
// ============================================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()
  const settings = await getSettings()

  const { data: sales, error } = await supabase
    .from('sales')
    .select('*')
    .order('sale_date', { ascending: false })

  if (error) throw new Error(`Error obteniendo ventas: ${error.message}`)

  const allSales = (sales ?? []) as Sale[]

  // Acumulados
  const machine_fund_accumulated = allSales.reduce(
    (sum, s) => sum + s.machine_fund_contribution,
    0,
  )
  const total_invoiced = allSales.reduce((sum, s) => sum + s.sale_price, 0)
  const total_costs = allSales.reduce((sum, s) => sum + s.total_cost, 0)
  const total_net_profit = allSales.reduce((sum, s) => sum + s.net_profit, 0)
  const total_rober = allSales.reduce((sum, s) => sum + s.rober_share, 0)
  const total_cris = allSales.reduce((sum, s) => sum + s.cris_share, 0)

  // % impresora pagada
  const printer_paid_pct = machine_fund_accumulated / settings.printer_total_cost
  const printer_remaining = Math.max(
    0,
    settings.printer_total_cost - machine_fund_accumulated,
  )

  // Control de verificación: debe ser 0
  const control_check = Math.round((total_net_profit - total_rober - total_cris) * 100) / 100

  return {
    printer_total_cost: settings.printer_total_cost,
    machine_fund_accumulated: Math.round(machine_fund_accumulated * 100) / 100,
    printer_paid_pct: Math.min(1, printer_paid_pct),
    printer_remaining: Math.round(printer_remaining * 100) / 100,
    total_invoiced: Math.round(total_invoiced * 100) / 100,
    total_costs: Math.round(total_costs * 100) / 100,
    total_net_profit: Math.round(total_net_profit * 100) / 100,
    total_rober: Math.round(total_rober * 100) / 100,
    total_cris: Math.round(total_cris * 100) / 100,
    control_check,
    sales_count: allSales.length,
    last_sales: allSales.slice(0, 5),
  }
}

// ============================================================
// OBTENER SETTINGS PÚBLICAS
// ============================================================

export async function getPublicSettings(): Promise<SettingsMap> {
  return getSettings()
}

// ============================================================
// OBTENER MATERIALES
// ============================================================

export async function getMaterials() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(`Error obteniendo materiales: ${error.message}`)
  return data ?? []
}

// ============================================================
// OBTENER PRODUCTOS DEL CATÁLOGO
// ============================================================

export async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, product_materials(*, material:materials(*))')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Error obteniendo productos: ${error.message}`)
  return data ?? []
}

// ============================================================
// GUARDAR PRODUCTO EN CATÁLOGO
// ============================================================

export interface SaveProductInput {
  name: string
  description?: string
  materials: { material_id: string; weight_grams: number }[]
  print_hours: number
  cost_filament: number
  cost_electricity: number
  cost_machine: number
  cost_labor: number
  calculated_cost: number
  suggested_price: number
  margin: number
}

export async function saveProduct(input: SaveProductInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('No autenticado')

  const totalWeight = input.materials.reduce((s, m) => s + m.weight_grams, 0)

  const { data: product, error: pErr } = await supabase
    .from('products')
    .insert({
      name: input.name,
      description: input.description || null,
      weight_grams: totalWeight,
      print_hours: input.print_hours,
      cost_filament: input.cost_filament,
      cost_electricity: input.cost_electricity,
      cost_machine: input.cost_machine,
      cost_labor: input.cost_labor,
      calculated_cost: input.calculated_cost,
      suggested_price: input.suggested_price,
      margin: input.margin,
      created_by: user.id,
    })
    .select()
    .single()

  if (pErr) throw new Error(`Error guardando producto: ${pErr.message}`)

  // Insertar materiales del producto
  if (input.materials.length > 0) {
    const { error: mErr } = await supabase.from('product_materials').insert(
      input.materials.map((m) => ({
        product_id: product.id,
        material_id: m.material_id,
        weight_grams: m.weight_grams,
      })),
    )
    if (mErr) throw new Error(`Error guardando materiales del producto: ${mErr.message}`)
  }

  revalidatePath('/calculator')
  return product
}

// ============================================================
// OBTENER VENTAS CON FILTROS
// ============================================================

export async function getSales(filters?: {
  seller?: SellerName | 'all'
  from?: string
  to?: string
  page?: number
  pageSize?: number
}) {
  const supabase = await createClient()
  const page = filters?.page ?? 1
  const pageSize = filters?.pageSize ?? 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('sales')
    .select('*', { count: 'exact' })
    .order('sale_date', { ascending: false })
    .range(from, to)

  if (filters?.seller && filters.seller !== 'all') {
    query = query.eq('seller_name', filters.seller)
  }
  if (filters?.from) {
    query = query.gte('sale_date', filters.from)
  }
  if (filters?.to) {
    query = query.lte('sale_date', filters.to)
  }

  const { data, count, error } = await query
  if (error) throw new Error(`Error obteniendo ventas: ${error.message}`)

  return { sales: (data ?? []) as Sale[], total: count ?? 0 }
}
