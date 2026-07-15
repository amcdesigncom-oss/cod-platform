import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuth'
import {
  LayoutDashboard, ShoppingBag, Sparkles, ClipboardList,
  Users, Settings, LogOut, Menu
} from 'lucide-react'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAdmin } = useAuthStore()

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Tableau de Bord' },
    { path: '/products', icon: ShoppingBag, label: 'Mes Produits' },
    { path: '/landing', icon: Sparkles, label: 'Générateur IA' },
    { path: '/leads', icon: ClipboardList, label: 'Leads & Commandes' },
    ...(isAdmin() ? [{ path: '/confirmers', icon: Users, label: 'Confirmateurs' }] : []),
    { path: '/settings', icon: Settings, label: 'Paramètres' },
  ]

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-dark-600 
        transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        <div className="p-6 border-b border-dark-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-xl">👕</div>
            <div>
              <h1 className="font-bold text-lg">COD Manager</h1>
              <p className="text-xs text-gray-500">E-Commerce Algérie</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <div
              key={item.path}
              onClick={() => { navigate(item.path); setSidebarOpen(false) }}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-600">
          <div className="flex items-center gap-3 mb-3 px-4 py-2">
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between p-4 bg-dark-800 border-b border-dark-600">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-dark-700 rounded-lg">
            <Menu size={24} />
          </button>
          <span className="font-bold">COD Manager</span>
          <div className="w-10" />
        </header>
        
        <div className="p-6 lg:p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}