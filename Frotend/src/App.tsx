import { useState } from 'react'
import { Page } from './types'
import Landing from './pages/Landing'
import Arrendatario from './pages/Arrendatario'
import Propietario from './pages/Propietario'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  const [page, setPage] = useState<Page>('landing')
  const navigate = (p: Page) => {
    window.scrollTo(0, 0)
    setPage(p)
  }

  return (
    <div className="min-h-full bg-white">
      {page === 'landing' && <Landing navigate={navigate} />}
      {page === 'arrendatario' && <Arrendatario navigate={navigate} />}
      {page === 'propietario' && <Propietario navigate={navigate} />}
      {page === 'admin-login' && <AdminLogin navigate={navigate} />}
      {page === 'admin-dashboard' && <AdminDashboard navigate={navigate} />}
    </div>
  )
}
