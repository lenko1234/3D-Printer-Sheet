import { getSales } from '@/lib/actions'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Plus, Filter } from 'lucide-react'
import SalesTableRow from '@/components/sales/SalesTableRow'

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
          <div className="hidden sm:grid grid-cols-[100px_130px_2.2fr_1fr_1fr_1fr_40px] gap-3 px-4 py-2.5 border-b text-xs font-medium text-gray-500 uppercase tracking-wider items-center"
            style={{ borderColor: 'rgba(55,65,81,0.5)' }}>
            <span>Fecha</span>
            <span>Vendedor</span>
            <span>Producto</span>
            <span>Precio</span>
            <span>Ganancia</span>
            <span>% Ganancia</span>
            <span className="w-6"></span>
          </div>

          <div className="flex flex-col">
            {sales.map((sale, idx) => (
              <SalesTableRow
                key={sale.id}
                sale={sale}
                isLast={idx === sales.length - 1}
              />
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
