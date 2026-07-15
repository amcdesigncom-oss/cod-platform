import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import LandingGenerator from './pages/LandingGenerator'
import Leads from './pages/Leads'
import Confirmers from './pages/Confirmers'
import Settings from './pages/Settings'

function App() {
  const { token } = useAuthStore()

  if (!token) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/landing" element={<LandingGenerator />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/confirmers" element={<Confirmers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App