import { getDashboardStats } from '@/lib/actions'
import { formatARS, formatPct } from '@/lib/calculations'
import type { Metadata } from 'next'
import SalesChart from '@/components/dashboard/SalesChart'
import RecentSalesTable from '@/components/dashboard/RecentSalesTable'
import {
  TrendingUp,
  Banknote,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  Printer,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Dashboard' }
export const revalidate = 60

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user!.id).single()

  let stats
  try {
    stats = await getDashboardStats()
  } catch {
    stats = null
  }

  const isRober = profile?.role === 'Rober'

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Error cargando estadísticas. Intenta recargar la página.</p>
      </div>
    )
  }

  const pct = Math.min(100, Math.round(stats.printer_paid_pct * 100))

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* ── FILA 1: Métricas principales ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Facturado */}
        <StatCard
          label="Total Facturado"
          value={formatARS(stats.total_invoiced)}
          icon={<Banknote className="w-5 h-5" />}
          color="#6366f1"
          sub={`${stats.sales_count} ventas`}
        />
        {/* Ganancia a Repartir */}
        <StatCard
          label="Ganancia a Repartir"
          value={formatARS(stats.total_net_profit)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="#10b981"
          sub={`Costos prod.: ${formatARS(stats.total_costs)}`}
        />
        {/* Mi Total */}
        <StatCard
          label={`Total ${profile?.display_name ?? 'Mío'}`}
          value={formatARS(isRober ? stats.total_rober : stats.total_cris)}
          icon={<ShoppingBag className="w-5 h-5" />}
          color={isRober ? '#7c3aed' : '#10b981'}
          sub={isRober ? 'Rober vende 70% · recibe 20%' : 'Cris vende 80% · recibe 30%'}
          highlight
        />
        {/* Verificación */}
        <StatCard
          label="Control"
          value={stats.control_check === 0 ? '✓ OK' : `⚠ ${stats.control_check}`}
          icon={
            stats.control_check === 0 ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )
          }
          color={stats.control_check === 0 ? '#10b981' : '#ef4444'}
          sub="Repartido − Rober − Cris = 0"
        />
      </div>

      {/* ── FILA 2: Fondo Impresora + Socios ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Fondo impresora */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.2)' }}
              >
                <Printer className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Fondo Impresora</p>
                <p className="text-xs text-gray-500">Bambu Lab A1 Mini</p>
              </div>
            </div>
            <span
              className="text-2xl font-bold"
              style={{ color: pct >= 100 ? '#10b981' : '#818cf8' }}
            >
              {pct}%
            </span>
          </div>

          <div className="progress-bar mb-3">
            <div
              className="progress-bar-fill"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Acumulado</p>
              <p className="text-sm font-bold text-white">
                {formatARS(stats.machine_fund_accumulated)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Costo Total</p>
              <p className="text-sm font-bold text-white">
                {formatARS(stats.printer_total_cost)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Falta</p>
              <p
                className="text-sm font-bold"
                style={{ color: stats.printer_remaining === 0 ? '#10b981' : '#f87171' }}
              >
                {formatARS(stats.printer_remaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Reparto Socios */}
        <div className="glass-card p-5">
          <p className="text-sm font-semibold text-white mb-4">Reparto de Ganancias</p>
          <div className="flex flex-col gap-3">
            {/* Rober */}
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg gradient-rober flex items-center justify-center text-white text-xs font-bold">R</div>
                <span className="text-sm font-medium text-purple-200">Rober</span>
              </div>
              <span className="text-sm font-bold text-purple-300">{formatARS(stats.total_rober)}</span>
            </div>
            {/* Cris */}
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg gradient-cris flex items-center justify-center text-white text-xs font-bold">C</div>
                <span className="text-sm font-medium text-emerald-200">Cris</span>
              </div>
              <span className="text-sm font-bold text-emerald-300">{formatARS(stats.total_cris)}</span>
            </div>
            {/* Total */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-gray-700 bg-gray-800/50">
              <span className="text-xs text-gray-400">Total a repartir</span>
              <span className="text-sm font-bold text-white">{formatARS(stats.total_net_profit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILA 3: Gráfico + Últimas ventas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <p className="text-sm font-semibold text-white mb-4">Ventas por Vendedor</p>
          <SalesChart roberTotal={stats.total_rober} crisTotal={stats.total_cris} />
        </div>
        <div className="glass-card p-5">
          <p className="text-sm font-semibold text-white mb-4">Últimas Ventas</p>
          <RecentSalesTable sales={stats.last_sales} />
        </div>
      </div>
    </div>
  )
}

// ── StatCard Component ──
function StatCard({
  label, value, icon, color, sub, highlight,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <div
      className="glass-card p-4 flex flex-col gap-3"
      style={highlight ? { borderColor: `${color}40` } : {}}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}25`, color }}
        >
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold text-white leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  )
}
