import { useState } from 'react'
import { useProducts, useLandingPages, generateLanding } from '../hooks/useApi'
import { Sparkles, Eye, ExternalLink, Copy } from 'lucide-react'

export default function LandingGenerator() {
  const { data: products } = useProducts()
  const { data: landingPages, refetch } = useLandingPages()
  const [selectedProduct, setSelectedProduct] = useState('')
  const [config, setConfig] = useState({ style: 'modern', color: '#6366f1', offer: 'Livraison Gratuite' })
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!selectedProduct) return alert('Sélectionnez un produit')
    setGenerating(true)
    try {
      await generateLanding(selectedProduct, config)
      refetch()
      alert('Landing page générée !')
    } catch (e) {
      alert('Erreur lors de la génération')
    }
    setGenerating(false)
  }

  const copyLink = (slug) => {
    const url = `${window.location.origin}/api/landing/preview/${slug}`
    navigator.clipboard.writeText(url)
    alert('Lien copié !')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Générateur IA Landing</h1>
        <p className="text-gray-400 text-sm">Créez des pages de conversion optimisées</p>
      </div>

      <div className="card bg-gradient-to-br from-accent/10 to-purple-500/10 border-accent/30">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-purple-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">
            🤖
          </div>
          <h2 className="text-xl font-bold">Générateur IA de Landing Pages</h2>
          <p className="text-gray-400 text-sm mt-1">L'IA génère le design, le copywriting et le formulaire COD</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Produit</label>
            <select className="input-field" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
              <option value="">Choisir un produit...</option>
              {products?.map(p => <option key={p._id} value={p._id}>{p.name} - {p.price.toLocaleString()} DA</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Style</label>
            <select className="input-field" value={config.style} onChange={e => setConfig({...config, style: e.target.value})}>
              <option value="modern">Moderne & Minimaliste</option>
              <option value="luxury">Luxe & Premium</option>
              <option value="sport">Sport & Dynamique</option>
              <option value="urgency">Urgence & Promotion</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Couleur</label>
            <input type="color" className="input-field h-12" value={config.color} onChange={e => setConfig({...config, color: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Offre</label>
            <select className="input-field" value={config.offer} onChange={e => setConfig({...config, offer: e.target.value})}>
              <option>Livraison Gratuite</option>
              <option>1 Acheté = 1 Offert</option>
              <option>-40% Aujourd'hui Seulement</option>
            </select>
          </div>
        </div>

        <button onClick={handleGenerate} disabled={generating} className="w-full btn-primary justify-center mt-6 py-3">
          <Sparkles size={20} /> {generating ? 'Génération...' : 'Générer la Landing Page'}
        </button>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">📄 Mes Landing Pages</h3>
        <div className="space-y-3">
          {landingPages?.map(page => (
            <div key={page._id} className="flex items-center justify-between p-4 bg-dark-700 rounded-xl">
              <div>
                <p className="font-medium">{page.title}</p>
                <p className="text-sm text-gray-500">{page.views} vues • {page.conversions} conversions</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.open(`https://cod-platform-production-9e18.up.railway.app/api/landing/preview/${page.slug}`, '_blank')} className="btn-ghost py-2 px-3">
  <Eye size={16} />
</button>
                <button onClick={() => copyLink(page.slug)} className="btn-ghost py-2 px-3">
                  <Copy size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}