import { useState } from 'react'
import { NavigateFn } from '../types'

const stats = [
  { value: '+12%', label: 'Alza en arriendos', detail: 'Aumento promedio en El Poblado en el último año' },
  { value: '34%', label: 'Precios inflados', detail: 'Publicaciones detectadas por encima del mercado real' },
  { value: '4.800+', label: 'Inmuebles indexados', detail: 'Actualizados automáticamente cada 24 horas' },
  { value: '3', label: 'Portales unificados', detail: 'Finca Raíz, Metrocuadrado y Vivareal en una sola vista' },
]

const problems = [
  {
    title: 'Incertidumbre en la valoración',
    desc: 'Los propietarios no saben si su precio es competitivo. Nuestro modelo estima el valor justo basado en el mercado actual.',
  },
  {
    title: 'Fragmentación de la oferta',
    desc: 'Los arrendatarios revisan múltiples portales sin poder compararlos. Habitá consolida todo en un solo lugar.',
  },
  {
    title: 'Desinformación del consumidor',
    desc: 'Cada inmueble muestra si su precio está por encima o por debajo del estimado del mercado en tiempo real.',
  },
  {
    title: 'Búsquedas ineficientes',
    desc: 'Filtros avanzados por sector, estrato, área y habitaciones para encontrar exactamente lo que buscas.',
  },
]

interface LandingProps {
  navigate: NavigateFn
}

export default function Landing({ navigate }: LandingProps) {
  const [sector, setSector] = useState('')
  const [tipo, setTipo] = useState('')

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-black px-6 md:px-16 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-10">
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2.5 text-white"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06C167" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-xl font-bold tracking-tight">habitá</span>
          </button>
          <div className="hidden md:flex items-center gap-7 text-white/80 text-sm font-medium">
            <button onClick={() => navigate('arrendatario')} className="hover:text-white transition-colors">Buscar</button>
            <button onClick={() => navigate('propietario')} className="hover:text-white transition-colors">Analizar</button>
            <a href="#como-funciona" className="hover:text-white transition-colors">¿Cómo funciona?</a>
          </div>
        </div>
        <button
          onClick={() => navigate('admin-login')}
          className="text-white text-sm font-medium border border-white/30 px-5 py-2 rounded-full hover:border-white hover:bg-white/5 transition-all"
        >
          Iniciar sesión
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 pt-16 pb-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Medellín, CO</span>
              <span className="text-[#06C167] cursor-pointer hover:underline ml-1">Cambiar ciudad</span>
            </div>
            <h1 className="text-5xl font-bold leading-[1.1] mb-8 tracking-tight">
              Encuentra tu próxima vivienda en Medellín
            </h1>

            <div className="bg-gray-100 rounded-2xl p-1 mb-4">
              <div className="flex items-center bg-white rounded-xl px-4 py-3.5 border-b border-gray-100 gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Sector o barrio (ej. El Poblado)"
                  value={sector}
                  onChange={e => setSector(e.target.value)}
                  className="w-full outline-none text-sm bg-transparent placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center bg-white rounded-xl px-4 py-3.5 mt-0.5 gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value)}
                  className="w-full outline-none text-sm bg-transparent text-gray-400 cursor-pointer"
                >
                  <option value="">Tipo de inmueble</option>
                  <option>Apartamento</option>
                  <option>Casa</option>
                  <option>Habitación</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => navigate('arrendatario')}
              className="w-full bg-black text-white font-semibold py-4 rounded-xl text-base hover:bg-gray-900 transition-colors"
            >
              Ver precios sugeridos
            </button>
            <button
              onClick={() => navigate('arrendatario')}
              className="block text-sm text-[#06C167] mt-3 hover:underline"
            >
              Inicia sesión para ver tu actividad reciente
            </button>
          </div>

          {/* Hero image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden bg-gray-200">
              <img
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=720&h=540&fit=crop&auto=format"
                alt="Apartamentos modernos en Medellín"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute bottom-5 left-5 right-5 bg-black/75 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
                <span className="text-white text-sm font-medium">¿Listo para encontrar tu hogar?</span>
                <button
                  onClick={() => navigate('arrendatario')}
                  className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ml-3"
                >
                  Explorar ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-black py-14">
        <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-sm font-semibold text-[#06C167] mb-1.5">{s.label}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{s.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Service cards */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 py-16" id="como-funciona">
        <h2 className="text-3xl font-bold mb-2">Explora lo que puedes hacer con habitá</h2>
        <p className="text-gray-500 mb-10">Una plataforma para cada tipo de usuario del mercado inmobiliario.</p>
        <div className="grid md:grid-cols-3 gap-5">
          {/* Arrendatario */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('arrendatario')}>
            <div className="h-44 overflow-hidden bg-gray-200">
              <img
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=250&fit=crop&auto=format"
                alt="Buscar inmueble"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <div className="text-xs font-semibold text-[#06C167] uppercase tracking-wider mb-2">Arrendatario</div>
              <h3 className="text-lg font-bold mb-2">Busca y compara propiedades</h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                Accede a miles de inmuebles de múltiples portales. Identifica las mejores ofertas con inteligencia artificial.
              </p>
              <button className="bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-full group-hover:bg-gray-800 transition-colors">
                Buscar inmuebles
              </button>
            </div>
          </div>

          {/* Propietario */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('propietario')}>
            <div className="h-44 overflow-hidden bg-gray-200">
              <img
                src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&h=250&fit=crop&auto=format"
                alt="Analizar propiedad"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <div className="text-xs font-semibold text-[#06C167] uppercase tracking-wider mb-2">Propietario</div>
              <h3 className="text-lg font-bold mb-2">Analiza el valor de tu inmueble</h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                Obtén una estimación de precio basada en datos del mercado. Compara con competidores de tu sector.
              </p>
              <button className="bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-full group-hover:bg-gray-800 transition-colors">
                Analizar mi inmueble
              </button>
            </div>
          </div>

          {/* Admin */}
          <div className="bg-black rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('admin-login')}>
            <div className="h-44 overflow-hidden bg-gray-800 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-3 p-6 opacity-60">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white/10 rounded-lg h-14 flex items-end p-2">
                    <div className="bg-[#06C167] rounded h-full w-1/3 mr-1" style={{ height: `${30 + i * 15}%` }} />
                    <div className="bg-white/30 rounded h-full w-1/3 mr-1" style={{ height: `${50 + i * 10}%` }} />
                    <div className="bg-white/20 rounded h-full w-1/3" style={{ height: `${40 + i * 12}%` }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6">
              <div className="text-xs font-semibold text-[#06C167] uppercase tracking-wider mb-2">Administración</div>
              <h3 className="text-lg font-bold text-white mb-2">Panel de control del sistema</h3>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Gestiona crawlers, reentrenamiento del modelo y supervisa las métricas del ecosistema.
              </p>
              <button className="bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors">
                Acceder al panel
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Info cards: sector problems */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <h2 className="text-3xl font-bold mb-2">El mercado tiene problemas. Nosotros tenemos soluciones.</h2>
          <p className="text-gray-500 mb-10 max-w-2xl">
            El sector inmobiliario en Medellín presenta múltiples retos que generan incertidumbre para arrendatarios y propietarios.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {problems.map((p, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mb-4 flex-shrink-0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market info cards */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 py-16">
        <h2 className="text-3xl font-bold mb-10">El sector inmobiliario en números</h2>
        <div className="grid md:grid-cols-3 gap-5">
          <div className="border border-gray-100 rounded-2xl p-7">
            <div className="text-4xl font-bold mb-1">$2.4M</div>
            <div className="text-sm font-semibold text-gray-800 mb-2">Precio promedio de arriendo</div>
            <div className="text-sm text-gray-500 leading-relaxed">
              Promedio en estratos 4-5 de Medellín. Los precios varían hasta un 40% según el sector y características del inmueble.
            </div>
          </div>
          <div className="border border-gray-100 rounded-2xl p-7">
            <div className="text-4xl font-bold mb-1">19 días</div>
            <div className="text-sm font-semibold text-gray-800 mb-2">Tiempo promedio en publicación</div>
            <div className="text-sm text-gray-500 leading-relaxed">
              Los inmuebles con precio ajustado al mercado se arriendan en la mitad del tiempo que los sobrevaluados.
            </div>
          </div>
          <div className="bg-black text-white rounded-2xl p-7">
            <div className="text-4xl font-bold mb-1 text-[#06C167]">IA</div>
            <div className="text-sm font-semibold mb-2">Modelo predictivo de precios</div>
            <div className="text-sm text-gray-400 leading-relaxed">
              Nuestro modelo tiene un margen de error inferior al 12% en la estimación de precios de arriendo en Medellín.
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Toma decisiones inmobiliarias con datos reales
          </h2>
          <p className="text-gray-500 mb-9 text-lg">
            Sin especulación. Sin incertidumbre. Información actualizada cada 24 horas.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('arrendatario')}
              className="bg-black text-white font-semibold px-8 py-4 rounded-full hover:bg-gray-900 transition-colors text-sm"
            >
              Buscar inmuebles
            </button>
            <button
              onClick={() => navigate('propietario')}
              className="border-2 border-black text-black font-semibold px-8 py-4 rounded-full hover:bg-gray-50 transition-colors text-sm"
            >
              Analizar mi propiedad
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-14 px-6 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06C167" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="font-bold text-lg">habitá</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Análisis de mercado inmobiliario en Medellín. Democratizando la información para mejores decisiones.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm text-gray-400">
            <div>
              <p className="font-semibold text-white mb-4">Plataforma</p>
              <p className="mb-2.5 hover:text-white cursor-pointer transition-colors" onClick={() => navigate('arrendatario')}>Buscar inmuebles</p>
              <p className="mb-2.5 hover:text-white cursor-pointer transition-colors" onClick={() => navigate('propietario')}>Analizar propiedad</p>
              <p className="hover:text-white cursor-pointer transition-colors">¿Cómo funciona?</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-4">Acceso</p>
              <p className="mb-2.5 hover:text-white cursor-pointer transition-colors" onClick={() => navigate('admin-login')}>Administración</p>
              <p className="mb-2.5 hover:text-white cursor-pointer transition-colors">Soporte</p>
              <p className="hover:text-white cursor-pointer transition-colors">Privacidad</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-gray-800 text-gray-600 text-xs">
          © 2024 Habitá — Medellín, Colombia
        </div>
      </footer>
    </div>
  )
}
