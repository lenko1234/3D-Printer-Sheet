// ============================================================
// LÓGICA DE NEGOCIO — Replica exacta de las fórmulas del Excel
// ============================================================

import type {
  MaterialInput,
  CostBreakdown,
  ProfitShare,
  SellerName,
  SettingsMap,
} from '@/types/database'

/**
 * Calcula el costo desglosado de una pieza.
 *
 * Fórmulas (Excel replicado exacto):
 *  Costo Filamento  = Σ(gramos_i * precio_gramo_i)
 *  Costo Electricidad = Horas * electricity_per_hour
 *  Costo Máquina    = Horas * machine_per_hour
 *  Costo Total      = Filamento + Electricidad + Máquina + Mano de Obra
 *  Precio Venta     = Costo Total * (1 + Margen)
 */
export function calculatePieceCost(
  materials: MaterialInput[],
  print_hours: number,
  settings: SettingsMap,
  margin?: number,
): CostBreakdown {
  const effectiveMargin = margin ?? settings.default_margin

  // 1. Costo Filamento: precio_por_kg / 1000 → precio_por_gramo
  const cost_filament = materials.reduce((sum, m) => {
    const price_per_gram = m.price_per_kg / 1000
    return sum + m.weight_grams * price_per_gram
  }, 0)

  // 2. Costo Electricidad
  const cost_electricity = print_hours * settings.electricity_per_hour

  // 3. Mano de obra fija
  const cost_labor = settings.labor_per_piece

  // 4. Costo Producción = Filamento + Electricidad + Mano de obra
  const cost_production = cost_filament + cost_electricity + cost_labor

  // 5. Fondo Impresora = exactamente el mismo valor que el Costo Producción
  const cost_machine = cost_production

  // 6. Total que se descuenta del precio = Costo Producción + Fondo Impresora
  const total_cost = cost_production + cost_machine // = 2 × costo_producción

  // 6. Precio de Venta Sugerido
  const suggested_price = total_cost * (1 + effectiveMargin)

  return {
    cost_filament: round2(cost_filament),
    cost_electricity: round2(cost_electricity),
    cost_machine: round2(cost_machine),
    cost_labor: round2(cost_labor),
    total_cost: round2(total_cost),
    suggested_price: round2(suggested_price),
  }
}

/**
 * Distribuye la ganancia neta entre Rober y Cris.
 *
 * Reglas exactas del Excel:
 *  Rober vende → Rober 70%, Cris 30%
 *  Cris vende  → Cris 80%,  Rober 20%
 */
export function calculateProfitShare(
  net_profit: number,
  seller: SellerName,
): ProfitShare {
  if (seller === 'Rober') {
    return {
      rober: round2(net_profit * 0.7),
      cris: round2(net_profit * 0.3),
    }
  } else {
    return {
      rober: round2(net_profit * 0.2),
      cris: round2(net_profit * 0.8),
    }
  }
}

/**
 * Formatea un número como moneda ARS.
 * Ej: 21000 → "$21.000"
 */
export function formatARS(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formatea un porcentaje con 1 decimal.
 * Ej: 0.4 → "40.0%"
 */
export function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

/** Redondea a 2 decimales para evitar errores de punto flotante */
function round2(n: number): number {
  return Math.round(n * 100) / 100
}
