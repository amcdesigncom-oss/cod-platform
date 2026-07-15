const statusConfig = {
  pending: { label: '⏳ En Attente', className: 'bg-amber-500/15 text-amber-400' },
  confirmed: { label: '✓ Confirmé', className: 'bg-emerald-500/15 text-emerald-400' },
  'no-answer': { label: '📵 Sans Réponse', className: 'bg-gray-500/15 text-gray-400' },
  'not-interested': { label: '❌ Pas Intéressé', className: 'bg-red-500/15 text-red-400' },
  'already-bought': { label: '🛍️ Déjà Acheté', className: 'bg-blue-500/15 text-blue-400' },
  shipped: { label: '🚚 Expédié', className: 'bg-purple-500/15 text-purple-400' },
  delivered: { label: '✅ Livré', className: 'bg-emerald-500/15 text-emerald-400' },
  cancelled: { label: '🚫 Annulé', className: 'bg-red-500/15 text-red-400' },
}

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-500/15 text-gray-400' }
  
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  )
}