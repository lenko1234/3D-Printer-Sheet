// ============================================================
// TIPOS DE BASE DE DATOS — generados desde el schema Supabase
// ============================================================

export type SellerName = 'Rober' | 'Cris'
export type MaterialType = 'PLA' | 'PLA+' | 'PLA+ Silk' | 'PETG' | 'ABS' | 'TPU' | 'ASA'

export interface Setting {
  id: number
  key: string
  value: number
  description: string | null
  updated_at: string
}

export interface Material {
  id: string
  name: string
  brand: string | null
  color: string | null
  material_type: string
  price_per_kg: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  weight_grams: number
  print_hours: number
  cost_filament: number
  cost_electricity: number
  cost_machine: number
  cost_labor: number
  calculated_cost: number
  suggested_price: number
  margin: number
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  product_materials?: ProductMaterial[]
}

export interface ProductMaterial {
  id: string
  product_id: string
  material_id: string
  weight_grams: number
  material?: Material
}

export interface Sale {
  id: string
  sale_date: string
  customer_name: string | null
  seller_id: string | null
  seller_name: SellerName
  product_id: string | null
  product_name: string
  sale_price: number
  total_cost: number
  cost_filament: number
  cost_electricity: number
  cost_machine: number
  cost_labor: number
  machine_fund_contribution: number
  net_profit: number // GENERATED
  rober_share: number
  cris_share: number
  notes: string | null
  created_at: string
}

export interface Profile {
  id: string
  display_name: string
  role: SellerName
  created_at: string
}

// ============================================================
// TIPOS PARA CÁLCULOS
// ============================================================

export interface MaterialInput {
  material_id: string
  weight_grams: number
  price_per_kg: number
  name?: string
  color?: string
}

export interface CostBreakdown {
  cost_filament: number
  cost_electricity: number
  cost_machine: number
  cost_labor: number
  total_cost: number
  suggested_price: number
}

export interface ProfitShare {
  rober: number
  cris: number
}

export interface DashboardStats {
  // Fondo impresora
  printer_total_cost: number
  machine_fund_accumulated: number
  printer_paid_pct: number
  printer_remaining: number
  // Totales
  total_invoiced: number
  total_costs: number
  total_net_profit: number
  // Por socio
  total_rober: number
  total_cris: number
  // Verificación
  control_check: number // debe ser 0
  // Ventas
  sales_count: number
  last_sales: Sale[]
}

export interface SettingsMap {
  electricity_per_hour: number
  labor_per_piece: number
  machine_per_hour: number
  printer_total_cost: number
  default_margin: number
}
