import { useState, useEffect } from 'react'
import { useSettings, updateSettings } from '../hooks/useApi'

export default function Settings() {
  const { data: settings, loading } = useSettings()
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (settings) setFormData(settings)
  }, [settings])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await updateSettings(formData)
  }

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-gray-400 text-sm">Personnalisez votre site web</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom de la Marque</label>
            <input className="input-field" value={formData.brandName || ''} onChange={e => setFormData({...formData, brandName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Logo (Emoji)</label>
            <input className="input-field" value={formData.brandLogo || ''} onChange={e => setFormData({...formData, brandLogo: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea className="input-field" rows={3} value={formData.brandDescription || ''} onChange={e => setFormData({...formData, brandDescription: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Téléphone</label>
            <input className="input-field" value={formData.contactPhone || ''} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input className="input-field" value={formData.contactEmail || ''} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Page Facebook</label>
            <input className="input-field" value={formData.facebookPage || ''} onChange={e => setFormData({...formData, facebookPage: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Frais de Livraison (DA)</label>
            <input type="number" className="input-field" value={formData.delivery?.deliveryFee || 500} onChange={e => setFormData({...formData, delivery: {...formData.delivery, deliveryFee: Number(e.target.value)}})} />
          </div>
        </div>
        <button type="submit" className="btn-primary">💾 Sauvegarder</button>
      </form>
    </div>
  )
}