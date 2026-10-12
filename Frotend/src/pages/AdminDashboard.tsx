import { useState } from 'react'
import { NavigateFn } from '../types'

type Tab = 'dashboard' | 'crawlers' | 'modelo'

const RMSE_DATA = [12.1, 11.8, 10.9, 11.2, 10.5, 9.8, 10.1, 9.5, 9.3, 9.3]
const SCRAPE_DATA = [
  { day: 'Lun', count: 1247 }, { day: 'Mar', count: 1189 }, { day: 'Mie', count: 1302 },
  { day: 'Jue', count: 1156 }, { day: 'Vie', count: 1301 }, { day: 'Sab', count: 987 },
  { day: 'Dom', count: 1247 },
]

const PORTALS = [
  { name: 'Finca Raíz', url: 'fincaraiz.com.co', records: 2134, lastRun: 'hace 2 horas', status: 'idle' as const },
  { name: 'Metrocuadrado', url: 'metrocuadrado.com', records: 1567, lastRun: 'hace 2 horas', status: 'idle' as const },
  { name: 'Vivareal', url: 'vivareal.com.co', records: 1102, lastRun: 'hace 3 horas', status: 'idle' as const },
]

const PIPELINE_STEPS = [
  { name: 'Extracción de datos', desc: 'Crawlers ejecutados — 4.803 registros cargados', done: true },
  { name: 'Limpieza y validación', desc: 'Registros sin URL eliminados, nulos imputados', done: true },
  { name: 'Codificación de variables', desc: 'Variables categóricas codificadas (estrato, tipo, barrio)', done: true },
  { name: 'Escalado numérico', desc: 'Normalización sobre conjunto de entrenamiento (80%)', done: true },
  { name: 'Entrenamiento del modelo', desc: 'Pendiente de ejecución manual', done: false },
  { name: 'Validación RMSE', desc: 'Criterio: RMSE ≤ 12% en conjunto de validación', done: false },
  { name: 'Despliegue a producción', desc: 'Solo si pasa validación RMSE', done: false },
]

const AUDIT_LOGS = [
  { time: '14:32:01', event: 'Crawler Finca Raíz completado', result: 'OK', records: 1247 },
  { time: '14:31:58', event: 'Crawler Metrocuadrado completado', result: 'OK', records: 1189 },
  { time: '14:31:45', event: 'Crawler Vivareal completado', result: 'OK', records: 987 },
  { time: '12:05:22', event: 'Reentrenamiento ejecutado', result: 'OK', records: null },
  { time: '12:05:08', event: 'Validación RMSE: 9.3%', result: 'OK', records: null },
  { time: '12:04:11', event: 'Modelo promovido a producción', result: 'OK', records: null },
  { time: '08:30:00', event: 'Crawler Finca Raíz completado', result: 'OK', records: 1302 },
  { time: '08:29:55', event: 'Crawler Metrocuadrado completado', result: 'ERROR', records: null },
]

function RMSEChart() {
  const W = 380, H = 110, padX = 10, padY = 12
  const min = 8, max = 13
  const xS = (i: number) => padX + (i / (RMSE_DATA.length - 1)) * (W - padX * 2)
  const yS = (v: number) => H - padY - ((v - min) / (max - min)) * (H - padY * 2)
  const path = RMSE_DATA.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xS(i)} ${yS(v)}`).join(' ')
  const area = `${path} L ${xS(RMSE_DATA.length - 1)} ${H - padY} L ${xS(0)} ${H - padY} Z`
  const threshold = yS(12)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="rmseGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06C167" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#06C167" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={padX} y1={threshold} x2={W - padX} y2={threshold} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
      <text x={W - padX - 2} y={threshold - 3} fontSize="7" fill="#ef4444" textAnchor="end" opacity="0.7">12% umbral</text>
      <path d={area} fill="url(#rmseGrad)" />
      <path d={path} fill="none" stroke="#06C167" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {RMSE_DATA.map((v, i) => (
        <circle key={i} cx={xS(i)} cy={yS(v)} r="2.5" fill="#06C167" stroke="white" strokeWidth="1.5" />
      ))}
    </svg>
  )
}

function ScrapesChart() {
  const maxVal = Math.max(...SCRAPE_DATA.map(d => d.count))
  const H = 90
  const barW = 30
  const gap = 16
  const W = SCRAPE_DATA.length * (barW + gap) + gap

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {SCRAPE_DATA.map((d, i) => {
        const barH = (d.count / maxVal) * H
        const x = gap + i * (barW + gap)
        return (
          <g key={i}>
            <rect x={x} y={H - barH} width={barW} height={barH} rx="4" fill={i === SCRAPE_DATA.length - 1 ? '#06C167' : '#e5e7eb'} />
            <text x={x + barW / 2} y={H + 13} fontSize="8" textAnchor="middle" fill="#9ca3af">{d.day}</text>
            {i === SCRAPE_DATA.length - 1 && (
              <text x={x + barW / 2} y={H - barH - 4} fontSize="7.5" textAnchor="middle" fill="#06C167" fontWeight="700">{d.count}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

type CrawlerStatus = 'idle' | 'running' | 'error'

interface AdminDashboardProps { navigate: NavigateFn }

export default function AdminDashboard({ navigate }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [crawlerStatuses, setCrawlerStatuses] = useState<Record<string, CrawlerStatus>>(
    Object.fromEntries(PORTALS.map(p => [p.name, 'idle']))
  )
  const [retraining, setRetraining] = useState<'idle' | 'running' | 'done'>('idle')
  const [pipelineStep, setPipelineStep] = useState(4)

  const runCrawler = (name: string) => {
    setCrawlerStatuses(s => ({ ...s, [name]: 'running' }))
    setTimeout(() => setCrawlerStatuses(s => ({ ...s, [name]: 'idle' })), 3500)
  }

  const runAll = () => {
    PORTALS.forEach(p => runCrawler(p.name))
  }

  const runRetraining = () => {
    if (retraining === 'running') return
    setRetraining('running')
    setPipelineStep(4)
    const steps = [4, 5, 6, 7]
    steps.forEach((step, i) => {
      setTimeout(() => setPipelineStep(step), i * 800)
    })
    setTimeout(() => setRetraining('done'), steps.length * 800 + 200)
  }

  const statusDot: Record<CrawlerStatus, string> = {
    idle: 'bg-gray-300', running: 'bg-yellow-400 animate-pulse', error: 'bg-red-500'
  }
  const statusLabel: Record<CrawlerStatus, string> = {
    idle: 'Inactivo', running: 'Ejecutando...', error: 'Error'
  }

  const totalRecords = PORTALS.reduce((a, p) => a + p.records, 0)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-black flex flex-col flex-shrink-0 sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-white/10">
          <button onClick={() => navigate('landing')} className="flex items-center gap-2 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06C167" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="font-bold">habitá</span>
          </button>
          <p className="text-gray-600 text-xs mt-1">Administración</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {([
            { id: 'dashboard', label: 'Dashboard', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg> },
            { id: 'crawlers', label: 'Crawlers', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg> },
            { id: 'modelo', label: 'Modelo IA', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
          ] as const).map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === item.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#06C167" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Administrador</p>
              <p className="text-gray-600 text-xs">admin@habita.co</p>
            </div>
          </div>
          <button
            onClick={() => navigate('admin-login')}
            className="w-full text-xs text-gray-600 hover:text-gray-400 flex items-center gap-2 px-1 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold">
              {tab === 'dashboard' ? 'Dashboard' : tab === 'crawlers' ? 'Orquestación de Crawlers' : 'Modelo Predictivo'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Última actualización: hoy a las 14:32</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
            <div className="w-2 h-2 bg-[#06C167] rounded-full animate-pulse" />
            Sistema operativo
          </div>
        </div>

        <div className="px-8 py-7">

          {/* ─── DASHBOARD TAB ─── */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total inmuebles', value: totalRecords.toLocaleString('es-CO'), sub: '+247 esta semana', color: 'text-black' },
                  { label: 'RMSE actual', value: '9.3%', sub: 'Por debajo del umbral (12%)', color: 'text-[#06C167]' },
                  { label: 'Portales activos', value: '3', sub: 'Finca Raíz, Metro, Vivareal', color: 'text-black' },
                  { label: 'Última extracción', value: 'hace 2h', sub: '1.247 registros procesados', color: 'text-black' },
                ].map(card => (
                  <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-2 font-medium">{card.label}</p>
                    <p className={`text-2xl font-bold ${card.color} mb-1`}>{card.value}</p>
                    <p className="text-xs text-gray-400">{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-sm">Evolución del RMSE</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Últimos 10 reentrenamientos</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">9.3% actual</span>
                  </div>
                  <RMSEChart />
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-sm">Registros extraídos por día</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Últimos 7 días</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">
                      {SCRAPE_DATA.reduce((a, d) => a + d.count, 0).toLocaleString('es-CO')} total
                    </span>
                  </div>
                  <ScrapesChart />
                </div>
              </div>

              {/* Audit log */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Registro de auditoría reciente</h3>
                  <span className="text-xs text-gray-400">Hoy · {new Date().toLocaleDateString('es-CO')}</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {AUDIT_LOGS.map((log, i) => (
                    <div key={i} className="px-6 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <span className="text-xs text-gray-400 font-mono w-16 flex-shrink-0">{log.time}</span>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${log.result === 'OK' ? 'bg-[#06C167]' : 'bg-red-500'}`} />
                      <span className="text-sm text-gray-700 flex-1">{log.event}</span>
                      {log.records !== null && (
                        <span className="text-xs text-gray-400">{log.records?.toLocaleString('es-CO')} registros</span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${log.result === 'OK' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {log.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── CRAWLERS TAB ─── */}
          {tab === 'crawlers' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">3 portales configurados · Ejecución automática cada 24 horas</p>
                </div>
                <button
                  onClick={runAll}
                  className="bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-900 transition-colors flex items-center gap-2"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Ejecutar todos
                </button>
              </div>

              <div className="grid gap-4">
                {PORTALS.map(portal => {
                  const status = crawlerStatuses[portal.name]
                  return (
                    <div key={portal.name} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-lg text-gray-600">
                          {portal.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold">{portal.name}</p>
                            <div className={`w-2 h-2 rounded-full ${statusDot[status]}`} />
                            <span className="text-xs text-gray-500">{statusLabel[status]}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{portal.url} · Última ejecución: {portal.lastRun}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="font-bold text-lg">{portal.records.toLocaleString('es-CO')}</p>
                          <p className="text-xs text-gray-400">registros activos</p>
                        </div>
                        <button
                          onClick={() => runCrawler(portal.name)}
                          disabled={status === 'running'}
                          className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          {status === 'running' ? (
                            <><div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> Ejecutando...</>
                          ) : (
                            <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg> Ejecutar</>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Live logs simulation */}
              <div className="bg-black rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-[#06C167] rounded-full animate-pulse" />
                  <h3 className="text-white text-sm font-semibold">Logs de ejecución recientes</h3>
                </div>
                <div className="space-y-1.5 font-mono text-xs">
                  {AUDIT_LOGS.slice(0, 5).map((log, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-gray-600">{log.time}</span>
                      <span className={log.result === 'OK' ? 'text-[#06C167]' : 'text-red-400'}>
                        [{log.result}]
                      </span>
                      <span className="text-gray-400">{log.event}{log.records ? ` (${log.records} registros)` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── MODELO TAB ─── */}
          {tab === 'modelo' && (
            <div className="space-y-5">
              {/* Model status card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-7">
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">RMSE actual</p>
                    <div className="text-5xl font-bold text-[#06C167] mb-1">9.3%</div>
                    <p className="text-xs text-gray-400">Umbral máximo: 12% · Estado: aprobado</p>
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#06C167] rounded-full" style={{ width: `${(9.3 / 12) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span><span className="text-red-400">12% límite</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Último entrenamiento</p>
                    <div className="text-2xl font-bold mb-1">Hoy 12:05</div>
                    <p className="text-xs text-gray-400">Dataset: 4.803 registros · Split 80/20</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Estado en producción</p>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-[#06C167] rounded-full" />
                      <span className="font-bold text-lg">Activo</span>
                    </div>
                    <p className="text-xs text-gray-400">Modelo v1.4.2 · Desplegado hoy</p>
                  </div>
                </div>
              </div>

              {/* Retrain button */}
              <div className="bg-white rounded-2xl border border-gray-100 p-7">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-base">Reentrenamiento del modelo</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Ejecuta el pipeline completo: preprocesamiento, entrenamiento y validación. Solo se desplegará si RMSE ≤ 12%.
                    </p>
                  </div>
                  <button
                    onClick={runRetraining}
                    disabled={retraining === 'running'}
                    className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0 ml-6"
                  >
                    {retraining === 'running' ? (
                      <><div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" /> Procesando...</>
                    ) : (
                      <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                      {retraining === 'done' ? 'Reentrenar de nuevo' : 'Iniciar reentrenamiento'}</>
                    )}
                  </button>
                </div>

                {/* Pipeline steps */}
                <div className="space-y-2.5">
                  {PIPELINE_STEPS.map((step, i) => {
                    const isDone = i < pipelineStep || (retraining === 'done')
                    const isActive = retraining === 'running' && i === pipelineStep
                    return (
                      <div key={step.name} className={`flex items-center gap-4 p-3.5 rounded-xl transition-colors ${isDone ? 'bg-green-50' : isActive ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-[#06C167]' : isActive ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                          {isDone ? (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                          ) : isActive ? (
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span className="text-gray-400 text-xs font-bold">{i + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${isDone ? 'text-green-700' : isActive ? 'text-yellow-700' : 'text-gray-500'}`}>{step.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {retraining === 'done' && (
                  <div className="mt-4 bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <p className="text-sm text-green-700 font-medium">
                      Reentrenamiento completado. RMSE validado: 9.1% — Modelo promovido a producción.
                    </p>
                  </div>
                )}
              </div>

              {/* RMSE chart in model view */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-sm mb-1">Historial de RMSE</h3>
                <p className="text-xs text-gray-400 mb-4">Evolución del error en los últimos 10 ciclos de entrenamiento</p>
                <RMSEChart />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
