import { useState } from 'react'
import { NavigateFn } from '../types'

const VALID_USER = 'admin'
const VALID_PASS = 'habita2024'
const MAX_ATTEMPTS = 3
const LOCK_MINUTES = 30

interface AdminLoginProps { navigate: NavigateFn }

export default function AdminLogin({ navigate }: AdminLoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [error, setError] = useState('')

  const remaining = MAX_ATTEMPTS - attempts

  const handleLogin = () => {
    if (locked) return
    if (username === VALID_USER && password === VALID_PASS) {
      navigate('admin-dashboard')
      return
    }
    const next = attempts + 1
    setAttempts(next)
    if (next >= MAX_ATTEMPTS) {
      setLocked(true)
      setError(`Acceso bloqueado por ${LOCK_MINUTES} minutos tras ${MAX_ATTEMPTS} intentos fallidos consecutivos.`)
    } else {
      setError(`Credenciales incorrectas. ${MAX_ATTEMPTS - next} ${MAX_ATTEMPTS - next === 1 ? 'intento restante' : 'intentos restantes'} antes del bloqueo.`)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="px-8 py-5 flex items-center justify-between">
        <button onClick={() => navigate('landing')} className="flex items-center gap-2 text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06C167" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-lg font-bold">habitá</span>
        </button>
        <span className="text-gray-600 text-xs">Panel de Administración</span>
      </div>

      {/* Center card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
          {/* Card header */}
          <div className="bg-gray-50 border-b border-gray-100 px-8 py-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06C167" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">Acceso restringido</h1>
                <p className="text-xs text-gray-500">Solo usuarios con rol Administrador</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            {locked ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h2 className="font-bold text-lg mb-2">Acceso bloqueado</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  Se han detectado {MAX_ATTEMPTS} intentos fallidos consecutivos. El acceso ha sido inhabilitado por <strong>{LOCK_MINUTES} minutos</strong>.
                </p>
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
                  Por seguridad, se ha registrado este evento de auditoría.
                </div>
                <button
                  onClick={() => { setLocked(false); setAttempts(0); setError(''); setUsername(''); setPassword('') }}
                  className="mt-5 text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Simular desbloqueo (prototipo)
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-6">Iniciar sesión</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Usuario</label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => { setUsername(e.target.value); setError('') }}
                      onKeyDown={handleKey}
                      placeholder="Nombre de usuario"
                      className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError('') }}
                        onKeyDown={handleKey}
                        placeholder="Contraseña"
                        className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      >
                        {showPass ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                  </div>
                )}

                {attempts > 0 && !locked && (
                  <div className="mt-3 flex gap-1">
                    {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${i < attempts ? 'bg-red-400' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                )}

                <button
                  onClick={handleLogin}
                  disabled={!username || !password}
                  className="mt-6 w-full bg-black text-white font-semibold py-3.5 rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Ingresar al panel
                </button>

                <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-400 leading-relaxed">
                  <span className="font-semibold text-gray-500">Prototipo:</span> usuario <code className="bg-gray-200 px-1 rounded">admin</code> / contraseña <code className="bg-gray-200 px-1 rounded">habita2024</code>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-5 text-center text-gray-700 text-xs">
        © 2024 Habitá · Acceso solo para personal autorizado
      </div>
    </div>
  )
}
