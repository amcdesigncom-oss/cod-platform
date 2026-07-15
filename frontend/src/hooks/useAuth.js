import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          localStorage.setItem('token', data.token)
          set({ user: data.user, token: data.token, isLoading: false })
          return true
        } catch (err) {
          set({ error: err.response?.data?.message || 'Erreur de connexion', isLoading: false })
          return false
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, error: null })
      },

      fetchUser: async () => {
        try {
          const { data } = await api.get('/auth/me')
          set({ user: data })
        } catch {
          get().logout()
        }
      },

      isAdmin: () => get().user?.role === 'admin',
      isConfirmer: () => ['confirmer', 'supervisor'].includes(get().user?.role),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)

export { api }