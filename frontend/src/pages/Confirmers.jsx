import { useState } from 'react'
import { useConfirmers, createConfirmer, deleteConfirmer } from '../hooks/useApi'
import { Plus, Trash2, X } from 'lucide-react'

export default function Confirmers() {
  const { data: confirmers, refetch } = useConfirmers()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', role: 'confirmer' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createConfirmer(formData)
    setShowForm(false)
    setFormData({ name: '', email: '', password: '', phone: '', role: 'confirmer' })
    refetch()
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce confirmateur ?')) return
    await deleteConfirmer(id)
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Confirmateurs</h1>
          <p className="text-gray-400 text-sm">Gérez votre équipe de confirmation</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={20} /> Ajouter</button>
      </div>

      {showForm && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Nouveau Confirmateur</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm text-gray-400 mb-1">Nom</label><input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Email</label><input type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Mot de passe</label><input type="password" className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Téléphone</label><input className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">💾 Créer</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {confirmers?.map(c => (
          <div key={c._id} className="card">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                {c.name.charAt(0)}
              </div>
              <h3 className="font-semibold">{c.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{c.role}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${c.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                {c.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-dark-600 text-center">
              <div><p className="text-xl font-bold">{c.performance?.totalLeads || 0}</p><p className="text-xs text-gray-500">Leads</p></div>
              <div><p className="text-xl font-bold text-emerald-400">{c.performance?.confirmed || 0}</p><p className="text-xs text-gray-500">Confirmés</p></div>
              <div><p className="text-xl font-bold">{c.performance?.conversionRate || 0}%</p><p className="text-xs text-gray-500">Taux</p></div>
            </div>
            <button onClick={() => handleDelete(c._id)} className="w-full mt-4 btn-danger py-2 text-sm justify-center"><Trash2 size={14} /> Supprimer</button>
          </div>
        ))}
      </div>
    </div>
  )
}