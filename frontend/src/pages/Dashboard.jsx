import { useDashboardStats } from '../hooks/useApi'
import { Package, Phone, Users, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function Dashboard() {
  const { data: stats, loading } = useDashboardStats()

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" /></div>

  const overview = stats?.overview || {}

  const statCards = [
    { label: 'Commandes Aujourd\'hui', value: overview.todayLeads || 0, icon: Package, color: 'text-accent' },
    { label: 'Taux de Confirmation', value: `${overview.conversionRate || 0}%`, icon: Phone, color: 'text-emerald-400' },
    { label: 'Nouveaux Leads', value: overview.totalLeads || 0, icon: Users, color: 'text-amber-400' },
    { label: 'Chiffre Confirmé', value: `${(overview.totalRevenue / 1000).toFixed(0)}K DA`, icon: DollarSign, color: 'text-purple-400' },
  ]

  const statusData = Object.entries(stats?.byStatus || {}).map(([name, value]) => ({
    name: name === 'pending' ? 'En Attente' : name === 'confirmed' ? 'Confirmés' : name === 'no-answer' ? 'Sans Réponse' : name === 'not-interested' ? 'Pas Intéressé' : name === 'shipped' ? 'Expédiés' : name,
    value
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de Bord</h1>
        <p className="text-gray-400 text-sm mt-1">Vue d'ensemble de votre business COD</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div key={i} className="card relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-purple-500" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{card.label}</p>
                <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value}</p>
              </div>
              <card.icon size={24} className="text-gray-600" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Évolution des Commandes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats?.dailyStats?.slice().reverse() || []}>
              <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: '12px' }} />
              <Bar dataKey="leads" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="confirmed" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Répartition par Statut</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {statusData.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-gray-400">{s.name}: {s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">🏆 Performance des Confirmateurs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-3">Confirmateur</th>
                <th className="pb-3">Leads</th>
                <th className="pb-3">Confirmés</th>
                <th className="pb-3">Taux</th>
                <th className="pb-3">Performance</th>
              </tr>
            </thead>
            <tbody>
              {stats?.confirmerStats?.map((c, i) => (
                <tr key={i} className="border-t border-dark-600">
                  <td className="py-3 font-medium">{c.name}</td>
                  <td className="py-3">{c.performance?.totalLeads || 0}</td>
                  <td className="py-3 text-emerald-400 font-semibold">{c.performance?.confirmed || 0}</td>
                  <td className="py-3">{c.performance?.conversionRate || 0}%</td>
                  <td className="py-3">
                    <div className="w-32 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ 
                        width: `${c.performance?.conversionRate || 0}%`,
                        background: c.performance?.conversionRate > 65 ? '#10b981' : c.performance?.conversionRate > 50 ? '#f59e0b' : '#ef4444'
                      }} />
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