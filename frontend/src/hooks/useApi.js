import { useState, useEffect, useCallback } from 'react'
import { api } from './useAuth'

// Hook générique pour les requêtes GET
export const useFetch = (url) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: res } = await api.get(url)
        setData(res)
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [url])

  return { data, loading, error, refetch: () => window.location.reload() }
}

// Dashboard
export const useDashboardStats = () => useFetch('/dashboard/stats')

// Products
export const useProducts = () => useFetch('/products')
export const createProduct = async (product) => {
  const { data } = await api.post('/products', product)
  return data
}
export const updateProduct = async (id, product) => {
  const { data } = await api.put(`/products/${id}`, product)
  return data
}
export const deleteProduct = async (id) => {
  await api.delete(`/products/${id}`)
}

// Leads
export const useLeads = (status) => {
  const url = status ? `/leads?status=${status}` : '/leads'
  return useFetch(url)
}
export const updateLeadStatus = async (id, status, notes) => {
  const { data } = await api.put(`/leads/${id}/status`, { status, notes })
  return data
}
export const assignLead = async (id, confirmerId) => {
  const { data } = await api.put(`/leads/${id}/assign`, { confirmerId })
  return data
}

// Confirmers
export const useConfirmers = () => useFetch('/confirmers')
export const createConfirmer = async (confirmer) => {
  const { data } = await api.post('/auth/register', confirmer)
  return data
}
export const deleteConfirmer = async (id) => {
  await api.delete(`/confirmers/${id}`)
}

// Landing
export const useLandingPages = () => useFetch('/landing')
export const generateLanding = async (productId, config) => {
  const { data } = await api.post('/landing/generate', { productId, config })
  return data
}

// Settings
export const useSettings = () => useFetch('/settings')
export const updateSettings = async (settings) => {
  const { data } = await api.put('/settings', settings)
  return data
}