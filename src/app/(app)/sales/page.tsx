import { getSales } from '@/lib/actions'
import { formatARS } from '@/lib/calculations'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Plus, Filter } from 'lucide-react'

export const metadata: Metadata = { title: 'Registro de Ventas' }
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ seller?: string; page?: string }>
}

export default async function SalesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const seller = params.seller as 'Rober' | 'Cris' | 'all' | undefined
  const page = parseInt(params.page ?? '1', 10)
  const pageSize = 15

  const { sales, total } = await getSales({
    seller: seller ?? 'all',
    page,
    pageSize,
  })

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Historial de Ventas</h1>
          <p className="text-sm text-gray-500">{total} ventas totales</p>
        </div>
        <Link href="/sales/new" id="new-sale-btn" className="btn btn-primary">
          <Plus className="w-4 h-4" /> Nueva Venta
        </Link>
      </div>

      {/* Filtros */}
      <div
        className="glass-card p-3 flex flex-wrap gap-2 items-center"
      >
        <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span className="text-xs text-gray-500 mr-1">Filtrar:</span>
        {(['all', 'Rober', 'Cris'] as const).map((s) => (
          <Link
            key={s}
            href={s === 'all' ? '/sales' : `/sales?seller=${s}`}
            className="badge transition-all"
            style={{
              background:
                (seller ?? 'all') === s
                  ? s === 'Rober'
                    ? 'rgba(124,58,237,0.3)'
                    : s === 'Cris'
                    ? 'rgba(16,185,129,0.3)'
                    : 'rgba(99,102,241,0.3)'
                  : 'rgba(55,65,81,0.3)',
              color:
                (seller ?? 'all') === s
                  ? s === 'Rober'
                    ? '#c4b5fd'
                    : s === 'Cris'
                    ? '#6ee7b7'
                    : '#a5b4fc'
                  : '#6b7280',
              border: '1px solid transparent',
            }}
          >
            {s === 'all' ? 'Todos' : s}
          </Link>
        ))}
      </div>

      {/* Tabla */}
      {sales.length === 0 ? (
        <div className="glass-card p-16 flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-3xl">📦</p>
          <p className="text-gray-400 font-medium">No hay ventas registradas</p>
          <p className="text-sm text-gray-600">
            {seller && seller !== 'all'
              ? `No hay ventas de ${seller} aún.`
              : 'Registrá tu primera venta usando el botón de arriba.'}
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          {/* Encabezado tabla desktop */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_1.2fr_1fr_1fr_1fr] gap-3 px-4 py-2.5 border-b text-xs font-medium text-gray-500 uppercase tracking-wider"
            style={{ borderColor: 'rgba(55,65,81,0.5)' }}>
            <span>Fecha</span>
            <span>Vendedor</span>
            <span>Producto</span>
            <span>Precio</span>
            <span>Ganancia</span>
            <span>Fondo Maq.</span>
          </div>

          <div className="flex flex-col">
            {sales.map((sale, idx) => (
              <div
                key={sale.id}
                className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1.2fr_1fr_1fr_1fr] gap-3 px-4 py-3 transition-colors hover:bg-gray-800/30"
                style={{
                  borderBottom: idx < sales.length - 1 ? '1px solid rgba(55,65,81,0.3)' : 'none',
                }}
              >
                <span className="text-sm text-gray-300">
                  {format(new Date(sale.sale_date), 'dd/MM/yy', { locale: es })}
                </span>
                <span
                  className="badge w-fit"
                  style={{
                    background: sale.seller_name === 'Rober' ? 'rgba(124,58,237,0.2)' : 'rgba(16,185,129,0.2)',
                    color: sale.seller_name === 'Rober' ? '#a78bfa' : '#6ee7b7',
                    border: `1px solid ${sale.seller_name === 'Rober' ? 'rgba(124,58,237,0.3)' : 'rgba(16,185,129,0.3)'}`,
                  }}
                >
                  {sale.seller_name}
                </span>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm font-medium text-white truncate">{sale.product_name}</p>
                  {sale.customer_name && (
                    <p className="text-xs text-gray-500 truncate">{sale.customer_name}</p>
                  )}
                </div>
                <span className="text-sm font-semibold text-white">{formatARS(sale.sale_price)}</span>
                <span className="text-sm font-semibold text-emerald-400">{formatARS(sale.net_profit)}</span>
                <span className="text-sm text-blue-400">{formatARS(sale.machine_fund_contribution)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/sales?${seller ? `seller=${seller}&` : ''}page=${page - 1}`}
              className="btn btn-secondary btn-sm"
            >
              ← Anterior
            </Link>
          )}
          <span className="text-sm text-gray-400">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/sales?${seller ? `seller=${seller}&` : ''}page=${page + 1}`}
              className="btn btn-secondary btn-sm"
            >
              Siguiente →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
