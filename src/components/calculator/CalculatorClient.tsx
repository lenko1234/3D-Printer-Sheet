'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculatePieceCost, formatARS } from '@/lib/calculations'
import { saveProduct, getMaterials, getProducts } from '@/lib/actions'
import type { Material, MaterialInput, SettingsMap, Product } from '@/types/database'
import {
  Plus, Trash2, Save, ShoppingCart, Calculator,
  Package, Zap, Wrench, ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

interface MaterialRow {
  id: string
  material_id: string
  weight_grams: number
}

interface Props {
  initialMaterials: Material[]
  initialProducts: Product[]
  settings: SettingsMap
  userProfile: { role: string; display_name: string } | null
}

export default function CalculatorClient({
  initialMaterials, initialProducts, settings, userProfile,
}: Props) {
  const [materials] = useState<Material[]>(initialMaterials)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [rows, setRows] = useState<MaterialRow[]>([
    { id: crypto.randomUUID(), material_id: materials[0]?.id ?? '', weight_grams: 0 },
  ])
  const [printHours, setPrintHours] = useState(1)
  const [margin, setMargin] = useState(settings.default_margin)
  const [productName, setProductName] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)

  const supabase = createClient()

  const materialInputs: MaterialInput[] = rows
    .filter((r) => r.material_id && r.weight_grams > 0)
    .map((r) => {
      const mat = materials.find((m) => m.id === r.material_id)
      return {
        material_id: r.material_id,
        weight_grams: r.weight_grams,
        price_per_kg: mat?.price_per_kg ?? 0,
        name: mat?.name,
        color: mat?.color ?? undefined,
      }
    })

  const breakdown = calculatePieceCost(materialInputs, printHours, settings, margin)
  const totalWeight = rows.reduce((s, r) => s + (r.weight_grams || 0), 0)

  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), material_id: materials[0]?.id ?? '', weight_grams: 0 },
    ])
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  function updateRow(id: string, field: keyof MaterialRow, value: string | number) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    )
  }

  async function handleSave() {
    if (!productName.trim()) return
    setSaving(true)
    const costProduction = breakdown.cost_filament + breakdown.cost_electricity + breakdown.cost_labor
    try {
      await saveProduct({
        name: productName.trim(),
        materials: rows
          .filter((r) => r.material_id && r.weight_grams > 0)
          .map((r) => ({ material_id: r.material_id, weight_grams: r.weight_grams })),
        print_hours: printHours,
        cost_filament: breakdown.cost_filament,
        cost_electricity: breakdown.cost_electricity,
        cost_machine: breakdown.cost_machine,
        cost_labor: breakdown.cost_labor,
        calculated_cost: costProduction,
        suggested_price: breakdown.suggested_price,
        margin,
      })
      setSavedMsg(true)
      setProductName('')
      const fresh = await getProducts()
      setProducts(fresh as Product[])
      setTimeout(() => setSavedMsg(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Calculadora ── */}
        <div className="glass-card p-5 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Calculadora de Costos</h2>
          </div>

          {/* Materiales */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Filamentos</label>
              <button onClick={addRow} className="btn btn-secondary btn-sm gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>
            {rows.map((row) => (
              <div key={row.id} className="flex gap-2 items-center">
                <select
                  value={row.material_id}
                  onChange={(e) => updateRow(row.id, 'material_id', e.target.value)}
                  className="flex-1 text-sm"
                  style={{ minWidth: 0 }}
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {formatARS(m.price_per_kg)}/kg
                    </option>
                  ))}
                </select>
                <div className="relative flex-shrink-0 w-28">
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={row.weight_grams || ''}
                    onChange={(e) => updateRow(row.id, 'weight_grams', parseFloat(e.target.value) || 0)}
                    placeholder="0 g"
                    className="text-sm pr-6"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">g</span>
                </div>
                {rows.length > 1 && (
                  <button
                    onClick={() => removeRow(row.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/40 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Horas y Margen */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Horas de impresión</label>
              <div className="relative">
                <input
                  type="number" min={0} step={0.5}
                  value={printHours || ''}
                  onChange={(e) => setPrintHours(parseFloat(e.target.value) || 0)}
                  className="pr-8 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">hs</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Margen de ganancia</label>
              <div className="relative">
                <input
                  type="number" min={0} max={500} step={5}
                  value={margin === 0 ? '' : (Math.round(margin * 100) || '')}
                  onChange={(e) => {
                    const val = e.target.value
                    setMargin(val === '' ? 0 : (parseFloat(val) || 0) / 100)
                  }}
                  placeholder="40"
                  className="pr-8 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">%</span>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-4 flex flex-col gap-2.5"
            style={{ background: 'rgba(30,30,60,0.5)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <p className="text-xs font-semibold text-indigo-300 mb-1 uppercase tracking-wider">Desglose de Costos</p>
            <CostRow
              icon={<Package className="w-3.5 h-3.5 text-amber-400" />}
              label={`Filamento (${totalWeight}g)`}
              value={breakdown.cost_filament}
            />
            <CostRow
              icon={<Zap className="w-3.5 h-3.5 text-yellow-400" />}
              label={`Electricidad ($${settings.electricity_per_hour}/h × ${printHours}h)`}
              value={breakdown.cost_electricity}
            />
            <CostRow
              icon={<ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
              label="Embalaje por pieza"
              value={breakdown.cost_labor}
            />
            <div className="border-t border-indigo-900/50 mt-1 pt-2.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Costo Total</span>
              <span className="text-sm font-bold text-white">{formatARS(breakdown.cost_filament + breakdown.cost_electricity + breakdown.cost_labor)}</span>
            </div>
            <div className="border-t border-indigo-900/50 mt-1 pt-2.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-indigo-300">Precio Venta Sugerido</span>
              <span className="text-lg font-bold text-indigo-300">{formatARS(breakdown.suggested_price)}</span>
            </div>
          </div>

          {/* Guardar en catálogo */}
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Nombre del producto para guardar..."
              className="text-sm"
            />
            <button
              id="save-product-btn"
              onClick={handleSave}
              disabled={saving || !productName.trim() || materialInputs.length === 0}
              className="btn btn-primary"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar en Catálogo'}
            </button>
            {savedMsg && (
              <p className="text-xs text-emerald-400 text-center">✓ Producto guardado en el catálogo</p>
            )}
          </div>
        </div>

        {/* ── Catálogo ── */}
        <div className="glass-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Catálogo de Productos</h2>
            </div>
            <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.25)' }}>
              {products.length} piezas
            </span>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
              <Package className="w-10 h-10 text-gray-700" />
              <p className="text-sm text-gray-500">Aún no hay productos guardados.</p>
              <p className="text-xs text-gray-600">Calculá una pieza y guardala para verla aquí.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[520px] pr-1">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl transition-colors hover:bg-gray-800/40"
                  style={{ border: '1px solid rgba(55,65,81,0.4)' }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      {p.weight_grams}g · {p.print_hours}h · Margen {Math.round(p.margin * 100)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      Costo Producción: {formatARS(p.cost_filament + p.cost_electricity + p.cost_labor)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold text-indigo-300">{formatARS(p.suggested_price)}</p>
                    <Link
                      href={`/sales/new?product_id=${p.id}&product_name=${encodeURIComponent(p.name)}&sale_price=${p.suggested_price}&total_cost=${p.cost_filament + p.cost_electricity + p.cost_labor}&cost_filament=${p.cost_filament}&cost_electricity=${p.cost_electricity}&cost_machine=${p.cost_machine}&cost_labor=${p.cost_labor}`}
                      className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" /> Vender
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CostRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {icon}
        <span className="text-xs text-gray-400 truncate">{label}</span>
      </div>
      <span className="text-xs font-semibold text-gray-200 flex-shrink-0">{formatARS(value)}</span>
    </div>
  )
}
