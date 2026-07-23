import { createClient } from '@/lib/supabase/server'
import { formatARS } from '@/lib/calculations'
import type { Metadata } from 'next'
import { getPublicSettings } from '@/lib/actions'

export const metadata: Metadata = { title: 'Configuración' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const settings = await getPublicSettings()

  const { data: materials } = await supabase
    .from('materials')
    .select('*')
    .order('name')

  const configItems = [
    { key: 'electricity_per_hour', label: 'Electricidad por hora', value: settings.electricity_per_hour, unit: 'ARS/hs' },
    { key: 'labor_per_piece', label: 'Embalaje por pieza', value: settings.labor_per_piece, unit: 'ARS/pieza' },
    { key: 'printer_total_cost', label: 'Costo Bambu Lab A1 Mini', value: settings.printer_total_cost, unit: 'ARS' },
    { key: 'default_margin', label: 'Margen de ganancia por defecto', value: Math.round(settings.default_margin * 100), unit: '%' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">
          Valores del negocio. Para modificarlos, editá directamente en Supabase Dashboard.
        </p>
      </div>

      {/* Settings actuales */}
      <div className="glass-card p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-white">Parámetros de Costo</h2>
        <div className="flex flex-col gap-3">
          {configItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-3 border-b"
              style={{ borderColor: 'rgba(55,65,81,0.4)' }}
            >
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-gray-500 font-mono">{item.key}</p>
              </div>
              <span
                className="text-sm font-bold px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}
              >
                {item.key === 'default_margin'
                  ? `${item.value}%`
                  : formatARS(item.value)}
                {item.unit !== 'ARS' && item.unit !== '%' ? ` / ${item.unit.replace('ARS/', '')}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fórmulas de reparto */}
      <div className="glass-card p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-white">Reglas de Reparto</h2>
        <div className="grid grid-cols-2 gap-3">
          <div
            className="p-4 rounded-xl"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' }}
          >
            <p className="text-sm font-semibold text-purple-300 mb-2">Rober vende</p>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rober</span>
                <span className="font-bold text-purple-300">70%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Cris</span>
                <span className="font-bold text-emerald-300">30%</span>
              </div>
            </div>
          </div>
          <div
            className="p-4 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <p className="text-sm font-semibold text-emerald-300 mb-2">Cris vende</p>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Cris</span>
                <span className="font-bold text-emerald-300">80%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rober</span>
                <span className="font-bold text-purple-300">20%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catálogo de filamentos */}
      <div className="glass-card p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-white">Catálogo de Filamentos</h2>
        <div className="flex flex-col gap-2">
          {(materials ?? []).map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between py-2.5 border-b"
              style={{ borderColor: 'rgba(55,65,81,0.3)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    background:
                      m.color?.toLowerCase() === 'dorado' ? '#f59e0b'
                      : m.color?.toLowerCase() === 'negro' ? '#1f2937'
                      : m.color?.toLowerCase() === 'blanco' ? '#f9fafb'
                      : m.color?.toLowerCase() === 'plateado' ? '#9ca3af'
                      : '#6366f1',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                />
                <div>
                  <p className="text-sm font-medium text-white">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.brand} · {m.material_type}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-amber-400">
                {formatARS(m.price_per_kg)}/kg
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600">
          Para agregar o modificar filamentos, usá el Supabase Dashboard → tabla <code className="text-gray-500">materials</code>
        </p>
      </div>
    </div>
  )
}
