import { useState } from 'react'
import { useAuthStore } from '../hooks/useAuth'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('admin@boutique.dz')
  const [password, setPassword] = useState('')
  const { login, isLoading, error } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">👕</div>
          <h1 className="text-3xl font-bold mb-2">COD Manager</h1>
          <p className="text-gray-400">Plateforme E-Commerce Algérie</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full btn-primary justify-center py-3 disabled:opacity-50">
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Se Connecter'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-600 text-center text-sm text-gray-500">
            <p>Démo: admin@boutique.dz / admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}