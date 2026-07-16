import { useState, useEffect } from 'react'
import { useLeads, updateLeadStatus, assignLead } from '../hooks/useApi'
import { useConfirmers } from '../hooks/useApi'
import StatusBadge from '../components/StatusBadge'
import { Phone, Check, X, Clock } from 'lucide-react'

const statusFilters = [
  { value: '', label: 'Tous' },
  { value: 'pending', label: '⏳ En Attente' },
  { value: 'confirmed', label: '✓ Confirmés' },
  { value: 'no-answer', label: '📵 Sans Réponse' },
  { value: 'not-interested', label: '❌ Pas Intéressé' },
  { value: 'shipped', label: '🚚 Expédiés' },
]

export default function Leads() {
  const [filter, setFilter] = useState('')
  const { data: leadsData, loading } = useLeads(filter)
  const { data: confirmers } = useConfirmers()
  
  // State local pour les leads
  const [leads, setLeads] = useState([])
  
  // Mettre à jour le state local quand les données arrivent
  useEffect(() => {
    if (leadsData) {
      setLeads(leadsData)
    }
  }, [leadsData])

  const handleStatusChange = async (id, status) => {
    await updateLeadStatus(id, status)
    // Mettre à jour localement
    setLeads(prev => prev.map(lead => 
      lead._id === id ? { ...lead, status } : lead
    ))
  }

  const handleAssign = async (leadId, confirmerId) => {
    if (!confirmerId) return
    
    // Trouver le nom du confirmer
    const confirmer = confirmers?.find(c => c._id === confirmerId)
    
    // Mettre à jour localement AVANT l'appel API
    setLeads(prev => prev.map(lead => 
      lead._id === leadId 
        ? { ...lead, assignedTo: { _id: confirmerId, name: confirmer?.name } } 
        : lead
    ))
    
    // Appel API en arrière-plan
    try {
      await assignLead(leadId, confirmerId)
    } catch (err) {
      console.error('Erreur:', err)
      // En cas d'erreur, on pourrait recharger les données
    }
  }

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leads & Commandes</h1>
        <p className="text-gray-400 text-sm">Gérez et suivez vos commandes</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f.value ? 'bg-accent text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-3 px-4">Date</th>
                <th className="pb-3 px-4">Client</th>
                <th className="pb-3 px-4">Téléphone</th>
                <th className="pb-3 px-4">Produit</th>
                <th className="pb-3 px-4">Wilaya</th>
                <th className="pb-3 px-4">Statut</th>
                <th className="pb-3 px-4">Assigné</th>
                <th className="pb-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead._id} className="border-t border-dark-600 hover:bg-dark-700/50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-400">{new Date(lead.createdAt).toLocaleDateString('fr')}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                    <p className="text-xs text-gray-500">{lead.commune}</p>
                  </td>
                  <td className="py-3 px-4 text-sm font-mono">{lead.phone}</td>
                  <td className="py-3 px-4 text-sm">{lead.product?.name}</td>
                  <td className="py-3 px-4 text-sm">{lead.wilaya}</td>
                  <td className="py-3 px-4"><StatusBadge status={lead.status} /></td>
                  <td className="py-3 px-4">
                    <select 
                      className="bg-dark-700 border border-dark-600 rounded-lg px-2 py-1 text-sm text-white"
                      value={lead.assignedTo?._id || ''}
                      onChange={(e) => handleAssign(lead._id, e.target.value)}
                    >
                      <option value="">Non assigné</option>
                      {confirmers?.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => handleStatusChange(lead._id, 'confirmed')} className="p-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all" title="Confirmer"><Check size={14} /></button>
                      <button onClick={() => handleStatusChange(lead._id, 'no-answer')} className="p-1.5 bg-gray-500/15 text-gray-400 rounded-lg hover:bg-gray-500 hover:text-white transition-all" title="Sans réponse"><Clock size={14} /></button>
                      <button onClick={() => handleStatusChange(lead._id, 'not-interested')} className="p-1.5 bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Pas intéressé"><X size={14} /></button>
                      <a href={`tel:${lead.phone}`} className="p-1.5 bg-blue-500/15 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all" title="Appeler"><Phone size={14} /></a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}