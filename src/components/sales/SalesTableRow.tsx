'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Sale } from '@/types/database'
import { formatARS } from '@/lib/calculations'
import { toggleSaleDistributed, updateSaleCustomer } from '@/lib/actions'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronDown, ChevronUp, User, FileText, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import DeleteSaleButton from './DeleteSaleButton'

interface Props {
  sale: Sale
  isLast: boolean
}

export default function SalesTableRow({ sale, isLast }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [isDistributed, setIsDistributed] = useState(sale.is_distributed ?? false)
  const [customerName, setCustomerName] = useState(sale.customer_name ?? '')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleToggleDistributed(e: React.MouseEvent) {
    e.stopPropagation()
    const nextState = !isDistributed
    setIsDistributed(nextState)

    startTransition(async () => {
      try {
        await toggleSaleDistributed(sale.id, nextState)
        router.refresh()
      } catch (err) {
        setIsDistributed(!nextState)
        alert(err instanceof Error ? err.message : 'Error actualizando estado')
      }
    })
  }

  function handleSaveCustomer(newCustomer: string) {
    if (newCustomer === (sale.customer_name ?? '')) return
    startTransition(async () => {
      try {
        await updateSaleCustomer(sale.id, newCustomer)
        router.refresh()
      } catch (err) {
        setCustomerName(sale.customer_name ?? '')
        alert(err instanceof Error ? err.message : 'Error actualizando cliente')
      }
    })
  }

  return (
    <div
      className="flex flex-col transition-colors"
      style={{
        borderBottom: !isLast ? '1px solid rgba(55,65,81,0.3)' : 'none',
      }}
    >
      {/* Fila principal */}
      <div
        onClick={() => setExpanded((prev) => !prev)}
        className={`grid grid-cols-2 sm:grid-cols-[100px_130px_2.2fr_1fr_1fr_1fr_40px] gap-3 px-4 py-3.5 items-center cursor-pointer transition-colors ${
          expanded ? 'bg-gray-800/40' : 'hover:bg-gray-800/25'
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-1 rounded text-gray-500 hover:text-indigo-300 transition-colors"
            title={expanded ? 'Ocultar detalles' : 'Ver detalles'}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-indigo-400" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <span className="text-sm text-gray-300 font-medium">
            {format(new Date(sale.sale_date), 'dd/MM/yy', { locale: es })}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="badge w-fit"
            style={{
              background:
                sale.seller_name === 'Rober'
                  ? 'rgba(124,58,237,0.2)'
                  : 'rgba(16,185,129,0.2)',
              color: sale.seller_name === 'Rober' ? '#a78bfa' : '#6ee7b7',
              border: `1px solid ${
                sale.seller_name === 'Rober'
                  ? 'rgba(124,58,237,0.3)'
                  : 'rgba(16,185,129,0.3)'
              }`,
            }}
          >
            {sale.seller_name}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <p className="text-sm font-semibold text-white truncate">{sale.product_name}</p>
          <p className="text-xs text-indigo-300/80 truncate">
            {customerName ? `👤 ${customerName}` : '👤 Sin cliente'}
          </p>
        </div>

        <span className="text-sm font-semibold text-white">{formatARS(sale.sale_price)}</span>
        <span className="text-sm font-bold text-emerald-400">{formatARS(sale.net_profit)}</span>
        <span className="text-sm font-semibold text-emerald-300">
          {sale.sale_price > 0 ? Math.round((sale.net_profit / sale.sale_price) * 100) : 0}%
        </span>

        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <DeleteSaleButton saleId={sale.id} productName={sale.product_name} />
        </div>
      </div>

      {/* Desplegable de detalles */}
      {expanded && (
        <div
          className="px-5 py-4 flex flex-col gap-4 animate-fade-in border-t"
          style={{
            background: 'rgba(20,20,40,0.6)',
            borderColor: 'rgba(99,102,241,0.2)',
          }}
        >
          {/* Encabezado Reparto con botón toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              💰 Reparto de Ganancia Neta ({formatARS(sale.net_profit)})
            </p>
            <button
              type="button"
              onClick={handleToggleDistributed}
              disabled={isPending}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isDistributed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
              }`}
              title="Hacé click para cambiar el estado del reparto"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isDistributed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{isDistributed ? 'Repartido' : 'A repartir'}</span>
            </button>
          </div>

          {/* Tarjetas de Reparto */}
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div
              className="p-3 rounded-xl flex flex-col gap-1"
              style={{
                background: 'rgba(124,58,237,0.15)',
                border: '1px solid rgba(124,58,237,0.3)',
              }}
            >
              <span className="text-xs text-purple-300 font-medium">
                Rober {sale.seller_name === 'Rober' ? '(Vendedor 70%)' : '(Socio 20%)'}
              </span>
              <span className="text-base font-bold text-purple-200">
                {formatARS(sale.rober_share)}
              </span>
            </div>
            <div
              className="p-3 rounded-xl flex flex-col gap-1"
              style={{
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
            >
              <span className="text-xs text-emerald-300 font-medium">
                Cris {sale.seller_name === 'Cris' ? '(Vendedor 80%)' : '(Socio 30%)'}
              </span>
              <span className="text-base font-bold text-emerald-200">
                {formatARS(sale.cris_share)}
              </span>
            </div>
          </div>

          {/* Total a transferir a Cris */}
          <div className="flex items-center justify-between p-2.5 px-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 max-w-md">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-emerald-300">Total a transferir a Cris</span>
              <span className="text-[10px] text-gray-400">
                Cris: {formatARS(sale.cris_share)} · Costo: {formatARS(sale.total_cost)} · Impresora: {formatARS(sale.machine_fund_contribution)}
              </span>
            </div>
            <span className="text-sm font-extrabold text-emerald-300">
              {formatARS(sale.cris_share + sale.total_cost + sale.machine_fund_contribution)}
            </span>
          </div>

          {/* Desglose de Costos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl pt-2 border-t border-gray-800/60 text-xs">
            <div className="flex flex-col gap-1.5">
              <p className="font-semibold text-gray-300 uppercase tracking-wider text-[11px] mb-1">
                Desglose de la Venta
              </p>
              <div className="flex justify-between">
                <span className="text-gray-400">Precio Venta Total:</span>
                <span className="font-bold text-white">{formatARS(sale.sale_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">− Costo Producción:</span>
                <span className="font-semibold text-red-400">−{formatARS(sale.total_cost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">− Fondo Impresora:</span>
                <span className="font-semibold text-blue-400">−{formatARS(sale.machine_fund_contribution)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="font-semibold text-gray-300 uppercase tracking-wider text-[11px] mb-1">
                Detalle de Costos de Producción
              </p>
              <div className="flex justify-between">
                <span className="text-gray-400">Filamento:</span>
                <span className="text-gray-200">{formatARS(sale.cost_filament)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Electricidad:</span>
                <span className="text-gray-200">{formatARS(sale.cost_electricity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Embalaje:</span>
                <span className="text-gray-200">{formatARS(sale.cost_labor)}</span>
              </div>
            </div>
          </div>

          {/* Cliente (Editable) */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-800/60 text-xs" onClick={(e) => e.stopPropagation()}>
            <label className="font-semibold text-gray-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Cliente (editar):
            </label>
            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onBlur={(e) => handleSaveCustomer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur()
                  }
                }}
                placeholder="Escribí el nombre del cliente..."
                className="w-full bg-gray-900/90 border border-gray-700/80 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 flex-shrink-0" />}
            </div>
          </div>

          {/* Notas si existen */}
          {sale.notes && (
            <div className="flex items-center gap-1.5 pt-2 border-t border-gray-800/60 text-xs text-gray-300">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-gray-400">Notas:</span>
              <span className="font-medium text-white">{sale.notes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
