'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { registerSale } from '@/lib/actions'
import { formatARS } from '@/lib/calculations'
import type { SellerName } from '@/types/database'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface Props {
  userProfile: { role: SellerName; display_name: string } | null
}

export default function SaleForm({ userProfile }: Props) {
  const params = useSearchParams()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-populate desde catálogo
  const rawTotalCost = parseFloat(params.get('total_cost') ?? '0') || 0
  const costFilament = parseFloat(params.get('cost_filament') ?? '0') || 0
  const costElectricity = parseFloat(params.get('cost_electricity') ?? '0') || 0
  const costLabor = parseFloat(params.get('cost_labor') ?? '0') || 0
  const costMachine = parseFloat(params.get('cost_machine') ?? '0') || 0

  // Costo Producción puro (sin incluir fondo impresora)
  const initialCostProduction = (costFilament || costElectricity || costLabor)
    ? (costFilament + costElectricity + costLabor)
    : rawTotalCost

  const [form, setForm] = useState({
    sale_date: new Date().toISOString().split('T')[0],
    customer_name: '',
    seller_name: (userProfile?.role ?? 'Rober') as SellerName,
    product_id: params.get('product_id') ?? '',
    product_name: params.get('product_name') ?? '',
    sale_price: parseFloat(params.get('sale_price') ?? '0') || 0,
    total_cost: initialCostProduction,
    cost_filament: costFilament,
    cost_electricity: costElectricity,
    cost_machine: costMachine || initialCostProduction,
    cost_labor: costLabor,
    quantity: 1,
    notes: '',
  })

  const qty = Math.max(1, form.quantity || 1)
  const unit_sale_price = form.sale_price
  const unit_total_cost = form.total_cost
  const unit_cost_machine = form.cost_machine

  const total_sale_price = unit_sale_price * qty
  const total_production_cost = unit_total_cost * qty
  const total_machine_cost = unit_cost_machine * qty

  // Ganancia a repartir total
  const net_profit = total_sale_price - total_production_cost - total_machine_cost
  const roberShare =
    form.seller_name === 'Rober' ? net_profit * 0.7 : net_profit * 0.2
  const crisShare =
    form.seller_name === 'Cris' ? net_profit * 0.8 : net_profit * 0.3

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type } = e.target
    const val = type === 'number' ? (value === '' ? 0 : parseFloat(value) || 0) : value

    setForm((prev) => {
      if (name === 'total_cost') {
        return {
          ...prev,
          total_cost: val as number,
          cost_machine: val as number, // Fondo Impresora se mantiene idéntico a Costo Producción
        }
      }
      return {
        ...prev,
        [name]: val,
      }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        await registerSale(form)
        setSuccess(true)
        setTimeout(() => router.push('/sales'), 1800)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error inesperado')
      }
    })
  }

  if (success) {
    return (
      <div className="glass-card p-10 flex flex-col items-center justify-center gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-900/50 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white">
          {qty > 1 ? `¡${qty} Ventas registradas!` : '¡Venta registrada!'}
        </h2>
        <p className="text-sm text-gray-400">Redirigiendo al historial...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 md:p-6 flex flex-col gap-5 animate-fade-in">
      <h2 className="text-base font-bold text-white">Datos de la Venta</h2>

      {/* Fila: Fecha + Vendedor */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Fecha *</label>
          <input type="date" name="sale_date" value={form.sale_date} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Vendedor *</label>
          <select name="seller_name" value={form.seller_name} onChange={handleChange}>
            <option value="Rober">Rober</option>
            <option value="Cris">Cris</option>
          </select>
        </div>
      </div>

      {/* Cliente + Producto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Cliente</label>
          <input type="text" name="customer_name" value={form.customer_name}
            onChange={handleChange} placeholder="Nombre del cliente" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Producto / Pieza *</label>
          <input type="text" name="product_name" value={form.product_name}
            onChange={handleChange} placeholder="Nombre del producto" required />
        </div>
      </div>

      {/* Cantidad + Precios Unitarios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Cantidad *</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity || ''}
            onChange={handleChange}
            min={1}
            step={1}
            placeholder="1"
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Precio Unitario (ARS) *</label>
          <input
            type="number"
            name="sale_price"
            value={form.sale_price || ''}
            onChange={handleChange}
            min={0}
            step="any"
            placeholder="0"
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Costo Unitario Producción (ARS) *</label>
          <input
            type="number"
            name="total_cost"
            value={form.total_cost || ''}
            onChange={handleChange}
            min={0}
            step="any"
            placeholder="Filamento + luz + mano de obra"
            required
          />
        </div>
      </div>

      {/* Fondo Impresora */}
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Fondo Impresora (ARS por unidad)</label>
        <input
          type="number"
          name="cost_machine"
          value={form.cost_machine || ''}
          readOnly
          className="bg-gray-900 border-gray-800 text-blue-300 font-semibold cursor-not-allowed"
          placeholder="Se calcula igual al costo de producción por unidad"
        />
        <p className="text-xs text-gray-600 mt-1">
          Igual al Costo de Producción por unidad (se acumula en el pozo hasta cubrir el costo de la impresora)
        </p>
      </div>

      {/* Preview Ganancia — desglose claro */}
      <div
        className="rounded-xl p-4 flex flex-col gap-2"
        style={{ background: 'rgba(30,30,60,0.5)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Desglose de la Venta</p>
          {qty > 1 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {qty} unidades
            </span>
          )}
        </div>

        {/* Precio Venta */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">
            Precio de Venta {qty > 1 ? `(${qty} × ${formatARS(unit_sale_price)})` : ''}
          </span>
          <span className="text-sm font-bold text-white">{formatARS(total_sale_price)}</span>
        </div>

        {/* Costo Producción */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">
            ─ Costo Producción {qty > 1 ? `(${qty} × ${formatARS(unit_total_cost)})` : ''}
          </span>
          <span className="text-sm font-medium text-red-400">−{formatARS(total_production_cost)}</span>
        </div>

        {/* Fondo Impresora */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">
            ─ Fondo Impresora {qty > 1 ? `(${qty} × ${formatARS(unit_cost_machine)})` : ''}
          </span>
          <span className="text-sm font-medium text-blue-400">−{formatARS(total_machine_cost)}</span>
        </div>

        {/* Divisor */}
        <div className="border-t my-1" style={{ borderColor: 'rgba(99,102,241,0.3)' }} />

        {/* Ganancia a Repartir */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-white">Ganancia a Repartir Total</span>
          <span className={`text-base font-bold ${net_profit >= 0 ? 'text-indigo-300' : 'text-red-400'}`}>
            {formatARS(net_profit)}
          </span>
        </div>

        {/* Splits */}
        {net_profit > 0 && (
          <>
            <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t" style={{ borderColor: 'rgba(55,65,81,0.4)' }}>
              <div
                className="flex flex-col items-center p-2 rounded-lg"
                style={{ background: 'rgba(124,58,237,0.15)' }}
              >
                <span className="text-xs text-gray-400 mb-0.5">
                  Rober {form.seller_name === 'Rober' ? '(70%)' : '(20%)'}
                </span>
                <span className="text-sm font-bold text-purple-300">{formatARS(roberShare)}</span>
              </div>
              <div
                className="flex flex-col items-center p-2 rounded-lg"
                style={{ background: 'rgba(16,185,129,0.15)' }}
              >
                <span className="text-xs text-gray-400 mb-0.5">
                  Cris {form.seller_name === 'Cris' ? '(80%)' : '(30%)'}
                </span>
                <span className="text-sm font-bold text-emerald-300">{formatARS(crisShare)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 mt-1 border-t border-emerald-500/20">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-emerald-300">Total a transferir a Cris</span>
                <span className="text-[10px] text-gray-400">
                  Cris: {formatARS(crisShare)} · Costo: {formatARS(total_production_cost)} · Impresora: {formatARS(total_machine_cost)}
                </span>
              </div>
              <span className="text-sm font-extrabold text-emerald-300">
                {formatARS(crisShare + total_production_cost + total_machine_cost)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Notas */}
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Notas</label>
        <textarea name="notes" value={form.notes} onChange={handleChange}
          rows={2} placeholder="Observaciones opcionales..." className="resize-none" />
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-800/50 rounded-lg px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/sales')}
          className="btn btn-secondary flex-1"
        >
          Cancelar
        </button>
        <button
          type="submit"
          id="submit-sale-btn"
          disabled={isPending}
          className="btn btn-primary flex-1"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isPending
            ? 'Registrando...'
            : qty > 1
            ? `Registrar Venta (${qty} unidades)`
            : 'Registrar Venta'}
        </button>
      </div>
    </form>
  )
}
