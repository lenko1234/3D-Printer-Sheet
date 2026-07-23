import type { Sale } from '@/types/database'
import { formatARS } from '@/lib/calculations'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  sales: Sale[]
}

export default function RecentSalesTable({ sales }: Props) {
  if (sales.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
        Sin ventas registradas aún
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {sales.map((sale) => (
        <div
          key={sale.id}
          className="flex items-center justify-between gap-2 p-3 rounded-xl transition-colors hover:bg-gray-800/50"
          style={{ border: '1px solid rgba(55,65,81,0.3)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Badge vendedor */}
            <span
              className="badge flex-shrink-0"
              style={{
                background:
                  sale.seller_name === 'Rober'
                    ? 'rgba(124,58,237,0.2)'
                    : 'rgba(16,185,129,0.2)',
                color: sale.seller_name === 'Rober' ? '#a78bfa' : '#6ee7b7',
                border: `1px solid ${sale.seller_name === 'Rober' ? 'rgba(124,58,237,0.3)' : 'rgba(16,185,129,0.3)'}`,
              }}
            >
              {sale.seller_name[0]}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{sale.product_name}</p>
              <p className="text-xs text-gray-500">
                {sale.customer_name || 'Sin cliente'} ·{' '}
                {format(new Date(sale.sale_date), 'dd MMM', { locale: es })}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-white">{formatARS(sale.sale_price)}</p>
            <p className="text-xs text-emerald-400">+{formatARS(sale.net_profit)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
