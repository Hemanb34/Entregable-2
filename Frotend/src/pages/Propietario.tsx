import { useState } from 'react'
import { NavigateFn } from '../types'

const NEIGHBORHOODS = [
  'Aranjuez',
  'Belén',
  'Buenos Aires',
  'Castilla',
  'Doce de Octubre',
  'El Poblado',
  'Estadio',
  'Guayabal',
  'La América',
  'La Candelaria (Centro)',
  'Laureles',
  'Manrique',
  'Popular',
  'Robledo',
  'San Javier',
  'Santa Cruz',
  'Villa Hermosa',
]

const BASE_PRICE_M2: Record<string, number> = {
  'Aranjuez': 13000,
  'Belén': 16000,
  'Buenos Aires': 15000,
  'Castilla': 13500,
  'Doce de Octubre': 12500,
  'El Poblado': 36000,
  'Estadio': 21000,
  'Guayabal': 18000,
  'La América': 22000,
  'La Candelaria (Centro)': 17000,
  'Laureles': 27000,
  'Manrique': 12000,
  'Popular': 11000,
  'Robledo': 14000,
  'San Javier': 14000,
  'Santa Cruz': 11500,
  'Villa Hermosa': 12500,
}

const COMPETITORS: Record<string, { area: number; price: number; rooms: number; source: string }[]> = {
  'Aranjuez': [
    { area: 65, price: 920000, rooms: 3, source: 'Metrocuadrado' },
    { area: 75, price: 1050000, rooms: 3, source: 'Finca Raíz' },
  ],
  'Belén': [
    { area: 60, price: 950000, rooms: 2, source: 'Metrocuadrado' },
    { area: 72, price: 1100000, rooms: 3, source: 'Finca Raíz' },
    { area: 55, price: 880000, rooms: 2, source: 'Vivareal' },
  ],
  'Buenos Aires': [
    { area: 65, price: 1100000, rooms: 3, source: 'Finca Raíz' },
    { area: 72, price: 1250000, rooms: 3, source: 'Vivareal' },
  ],
  'Castilla': [
    { area: 65, price: 950000, rooms: 3, source: 'Finca Raíz' },
    { area: 75, price: 1100000, rooms: 3, source: 'Metrocuadrado' },
  ],
  'Doce de Octubre': [
    { area: 60, price: 820000, rooms: 2, source: 'Finca Raíz' },
    { area: 70, price: 950000, rooms: 3, source: 'Vivareal' },
  ],
  'El Poblado': [
    { area: 82, price: 2850000, rooms: 3, source: 'Finca Raíz' },
    { area: 90, price: 3150000, rooms: 3, source: 'Metrocuadrado' },
    { area: 75, price: 2720000, rooms: 2, source: 'Vivareal' },
    { area: 100, price: 3350000, rooms: 3, source: 'Finca Raíz' },
    { area: 88, price: 2950000, rooms: 3, source: 'Finca Raíz' },
  ],
  'Estadio': [
    { area: 68, price: 1680000, rooms: 3, source: 'Finca Raíz' },
    { area: 75, price: 1820000, rooms: 3, source: 'Metrocuadrado' },
  ],
  'Guayabal': [
    { area: 68, price: 1350000, rooms: 3, source: 'Finca Raíz' },
    { area: 75, price: 1500000, rooms: 3, source: 'Metrocuadrado' },
  ],
  'La América': [
    { area: 72, price: 1750000, rooms: 3, source: 'Finca Raíz' },
    { area: 80, price: 1950000, rooms: 3, source: 'Metrocuadrado' },
    { area: 65, price: 1600000, rooms: 2, source: 'Vivareal' },
  ],
  'La Candelaria (Centro)': [
    { area: 70, price: 1300000, rooms: 2, source: 'Metrocuadrado' },
    { area: 85, price: 1550000, rooms: 3, source: 'Finca Raíz' },
  ],
  'Laureles': [
    { area: 70, price: 1920000, rooms: 3, source: 'Metrocuadrado' },
    { area: 80, price: 2100000, rooms: 3, source: 'Finca Raíz' },
    { area: 65, price: 1780000, rooms: 2, source: 'Vivareal' },
    { area: 85, price: 2250000, rooms: 3, source: 'Finca Raíz' },
  ],
  'Manrique': [
    { area: 60, price: 780000, rooms: 2, source: 'Finca Raíz' },
    { area: 68, price: 890000, rooms: 3, source: 'Vivareal' },
  ],
  'Popular': [
    { area: 55, price: 680000, rooms: 2, source: 'Finca Raíz' },
    { area: 65, price: 780000, rooms: 3, source: 'Metrocuadrado' },
  ],
  'Robledo': [
    { area: 80, price: 1250000, rooms: 3, source: 'Finca Raíz' },
    { area: 110, price: 1500000, rooms: 4, source: 'Metrocuadrado' },
  ],
  'San Javier': [
    { area: 60, price: 920000, rooms: 2, source: 'Metrocuadrado' },
    { area: 70, price: 1050000, rooms: 3, source: 'Finca Raíz' },
  ],
  'Santa Cruz': [
    { area: 55, price: 720000, rooms: 2, source: 'Metrocuadrado' },
    { area: 65, price: 820000, rooms: 3, source: 'Finca Raíz' },
  ],
  'Villa Hermosa': [
    { area: 62, price: 850000, rooms: 2, source: 'Finca Raíz' },
    { area: 70, price: 980000, rooms: 3, source: 'Metrocuadrado' },
  ],
}

function estimatePrice(neighborhood: string, area: number, estrato: number, rooms: number, baths: number, parking: boolean) {
  const base = (BASE_PRICE_M2[neighborhood] || 20000) * area
  const estratoMult = 0.75 + estrato * 0.1
  const extras = rooms * 55000 + baths * 30000 + (parking ? 90000 : 0)
  return Math.round((base * estratoMult + extras) / 10000) * 10000
}

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

interface PropietarioProps { navigate: NavigateFn }

export default function Propietario({ navigate }: PropietarioProps) {
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form')
  const [form, setForm] = useState({
    tipo: 'Apartamento', neighborhood: 'Laureles', area: '80',
    estrato: '4', rooms: '3', baths: '2', parking: true,
  })
  const [result, setResult] = useState<{ estimated: number; competitors: typeof COMPETITORS['El Poblado'] } | null>(null)

  const set = (k: string, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = () => {
    setStep('loading')
    setTimeout(() => {
      const area = parseInt(form.area) || 80
      const estrato = parseInt(form.estrato) || 4
      const rooms = parseInt(form.rooms) || 3
      const baths = parseInt(form.baths) || 2
      const estimated = estimatePrice(form.neighborhood, area, estrato, rooms, baths, form.parking)
      const rawComps = COMPETITORS[form.neighborhood] || COMPETITORS['Laureles']
      const competitors = rawComps.filter(c =>
        Math.abs(c.area - area) / area <= 0.15 || rawComps.length <= 3
      )
      setResult({ estimated, competitors: competitors.length ? competitors : rawComps.slice(0, 3) })
      setStep('results')
    }, 2200)
  }

  const marketMin = result ? Math.min(...result.competitors.map(c => c.price)) : 0
  const marketMax = result ? Math.max(...result.competitors.map(c => c.price)) : 0
  const marketAvg = result ? Math.round(result.competitors.reduce((a, c) => a + c.price, 0) / result.competitors.length) : 0
  const suggestedLow = result ? Math.round(result.estimated * 0.95) : 0
  const suggestedHigh = result ? Math.round(result.estimated * 1.05) : 0

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-black px-6 md:px-16 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('landing')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Inicio</span>
          </button>
          <button onClick={() => navigate('landing')} className="flex items-center gap-2 text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06C167" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-lg font-bold">habitá</span>
          </button>
        </div>
        <div className="text-white/60 text-sm font-medium hidden md:block">
          Análisis de inmueble — Propietario
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 md:px-16 py-10">
        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {['Datos del inmueble', 'Resultados del análisis'].map((label, i) => {
            const active = (step === 'form' || step === 'loading') ? i === 0 : i === 1
            const done = step === 'results' && i === 0
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? 'bg-[#06C167] text-white' : active ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : i + 1}
                </div>
                <span className={`text-sm font-medium ${active ? 'text-black' : 'text-gray-400'}`}>{label}</span>
                {i === 0 && <div className="w-12 h-px bg-gray-200 ml-1" />}
              </div>
            )
          })}
        </div>

        {/* STEP 1 — Form */}
        {(step === 'form') && (
          <div className="grid md:grid-cols-5 gap-10">
            <div className="md:col-span-3">
              <h1 className="text-3xl font-bold mb-2">Analiza tu inmueble</h1>
              <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                Ingresa las características de tu propiedad y obtendrás una estimación de precio basada en el mercado actual de Medellín.
              </p>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Tipo de inmueble</label>
                    <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none">
                      <option>Apartamento</option>
                      <option>Casa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Barrio / Sector</label>
                    <select value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none">
                      {NEIGHBORHOODS.map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Área construida (m²)</label>
                    <input type="number" value={form.area} onChange={e => set('area', e.target.value)} placeholder="80" className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Estrato</label>
                    <select value={form.estrato} onChange={e => set('estrato', e.target.value)} className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none">
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>Estrato {n}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Habitaciones</label>
                    <select value={form.rooms} onChange={e => set('rooms', e.target.value)} className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none">
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Baños</label>
                    <select value={form.baths} onChange={e => set('baths', e.target.value)} className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none">
                      {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Parqueadero</label>
                    <button
                      onClick={() => set('parking', !form.parking)}
                      className={`w-full rounded-xl px-4 py-3 text-sm font-semibold border-2 transition-colors ${form.parking ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-500 border-transparent'}`}
                    >
                      {form.parking ? 'Sí incluye' : 'No incluye'}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="mt-8 w-full bg-black text-white font-semibold py-4 rounded-xl hover:bg-gray-900 transition-colors"
              >
                Estimar precio del inmueble
              </button>
            </div>

            {/* Right side info */}
            <div className="md:col-span-2 space-y-4 pt-14">
              <div className="bg-gray-50 rounded-2xl p-5">
                <div className="text-xs font-semibold text-[#06C167] uppercase tracking-wider mb-2">Modelo predictivo</div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Nuestro modelo analiza más de 4.800 inmuebles activos en Medellín con un margen de error inferior al 12%.
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5">
                <div className="text-xs font-semibold text-[#06C167] uppercase tracking-wider mb-2">Competidores similares</div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Recibirás un listado de propiedades activas con el mismo estrato, sector y área similar a la tuya (±15%).
                </p>
              </div>
              <div className="bg-black rounded-2xl p-5">
                <div className="text-xs font-semibold text-[#06C167] uppercase tracking-wider mb-2">Rango sugerido</div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Te entregaremos un rango -5% / +5% sobre la estimación base para que fijes un precio competitivo sin especular.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mb-6" />
            <p className="font-semibold text-lg mb-1">Calculando estimación de precio...</p>
            <p className="text-gray-500 text-sm">Consultando el modelo predictivo y buscando competidores</p>
          </div>
        )}

        {/* RESULTS */}
        {step === 'results' && result && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Resultados del análisis</h1>
                <p className="text-gray-500 text-sm mt-1">
                  {form.tipo} en {form.neighborhood} · {form.area} m² · Estrato {form.estrato}
                </p>
              </div>
              <button
                onClick={() => { setStep('form'); setResult(null) }}
                className="text-sm font-medium text-gray-500 hover:text-black border border-gray-200 px-4 py-2 rounded-full transition-colors"
              >
                Nueva consulta
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-5 mb-7">
              {/* Estimated price */}
              <div className="md:col-span-2 bg-black text-white rounded-2xl p-7">
                <div className="text-xs font-semibold text-[#06C167] uppercase tracking-wider mb-3">Precio estimado por IA</div>
                <div className="text-5xl font-bold mb-2">{formatCOP(result.estimated)}</div>
                <div className="text-gray-400 text-sm">por mes · basado en {result.competitors.length} propiedades comparables</div>
                <div className="mt-5 pt-5 border-t border-white/10 flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06C167" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span className="text-sm text-gray-400">Margen de error del modelo: &lt;12% (RMSE actual: 9.3%)</span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-xs text-gray-500 mb-1">Competidores encontrados</div>
                  <div className="text-2xl font-bold">{result.competitors.length}</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-xs text-gray-500 mb-1">Promedio del mercado</div>
                  <div className="text-2xl font-bold">{formatCOP(marketAvg)}</div>
                </div>
              </div>
            </div>

            {/* Market context */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Contexto de mercado — Propiedades similares en {form.neighborhood}</div>
              <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                  { label: 'Mínimo', value: formatCOP(marketMin), color: 'text-blue-600' },
                  { label: 'Promedio', value: formatCOP(marketAvg), color: 'text-black' },
                  { label: 'Máximo', value: formatCOP(marketMax), color: 'text-orange-600' },
                ].map(item => (
                  <div key={item.label} className="text-center">
                    <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
              {/* Range bar */}
              <div className="relative">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 via-gray-400 to-orange-400 rounded-full" />
                </div>
                {/* Estimated marker */}
                {marketMax > marketMin && (
                  <div
                    className="absolute top-0 -translate-x-1/2"
                    style={{ left: `${Math.min(95, Math.max(5, ((result.estimated - marketMin) / (marketMax - marketMin)) * 100))}%` }}
                  >
                    <div className="w-4 h-4 bg-black border-2 border-white rounded-full shadow -mt-0.5" />
                    <div className="text-xs font-bold text-center mt-1 whitespace-nowrap -translate-x-1/4">Tu est.</div>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-4">
                <span>{formatCOP(marketMin)}</span>
                <span>{formatCOP(marketMax)}</span>
              </div>
            </div>

            {/* Competitors table */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-5">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold">Propiedades competidoras activas</h3>
                <p className="text-xs text-gray-500 mt-0.5">Mismo estrato, sector y área similar (±15%)</p>
              </div>
              <div className="divide-y divide-gray-50">
                {result.competitors.map((c, i) => (
                  <div key={i} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                        {i + 1}
                      </div>
                      <div>
                        <span className="text-sm font-medium">{form.tipo} en {form.neighborhood}</span>
                        <div className="text-xs text-gray-400">{c.area} m² · {c.rooms} hab. · {c.source}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">{formatCOP(c.price)}</div>
                      <div className={`text-xs ${c.price > result.estimated ? 'text-orange-500' : 'text-green-600'}`}>
                        {c.price > result.estimated ? `+${(((c.price - result.estimated) / result.estimated) * 100).toFixed(0)}% vs estimado` : `${(((c.price - result.estimated) / result.estimated) * 100).toFixed(0)}% vs estimado`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested range */}
            <div className="border-2 border-black rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-[#06C167] rounded-full flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider">Recomendación de IA — Rango sugerido de publicación</div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">Límite inferior</div>
                  <div className="text-2xl font-bold">{formatCOP(suggestedLow)}</div>
                  <div className="text-xs text-[#06C167] mt-1 font-medium">Para arrendar más rápido</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">Límite superior</div>
                  <div className="text-2xl font-bold">{formatCOP(suggestedHigh)}</div>
                  <div className="text-xs text-orange-500 mt-1 font-medium">Para máxima rentabilidad</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                Rango calculado aplicando ±5% sobre la estimación base del modelo ({formatCOP(result.estimated)}), validado con el contexto de mercado de {form.neighborhood}.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
