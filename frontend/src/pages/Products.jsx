import { useState } from 'react'
import { useProducts, createProduct, deleteProduct } from '../hooks/useApi'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

export default function Products() {
  const { data: products, loading, refetch } = useProducts()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', oldPrice: '', stock: '', category: 'Vêtements', features: '', images: ['👕']
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createProduct({
      ...formData,
      price: Number(formData.price),
      oldPrice: Number(formData.oldPrice) || 0,
      stock: Number(formData.stock) || 0,
      features: formData.features.split('\n').filter(f => f.trim())
    })
    setShowForm(false)
    setFormData({ name: '', description: '', price: '', oldPrice: '', stock: '', category: 'Vêtements', features: '', images: ['👕'] })
    refetch()
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return
    await deleteProduct(id)
    refetch()
  }

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mes Produits</h1>
          <p className="text-gray-400 text-sm">Gérez votre catalogue de vêtements</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={20} /> Ajouter un Produit
        </button>
      </div>

      {showForm && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Nouveau Produit</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom</label>
              <input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Prix (DA)</label>
              <input type="number" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ancien Prix</label>
              <input type="number" className="input-field" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Stock</label>
              <input type="number" className="input-field" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea className="input-field" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Points forts (un par ligne)</label>
              <textarea className="input-field" rows={3} value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} placeholder="✓ Livraison gratuite&#10;✓ Paiement à la livraison" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">💾 Enregistrer</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products?.map(product => (
          <div key={product._id} className="card hover:border-accent/50 transition-all cursor-pointer group">
            <div className="h-48 bg-gradient-to-br from-dark-700 to-dark-600 rounded-xl flex items-center justify-center text-6xl mb-4">
              {product.images?.[0] || '👕'}
            </div>
            <h3 className="font-semibold mb-1">{product.name}</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-xl font-bold text-accent">{product.price.toLocaleString()} DA</span>
              {product.oldPrice > 0 && <span className="text-sm text-gray-500 line-through">{product.oldPrice.toLocaleString()} DA</span>}
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Stock: {product.stock}</span>
              <span>{product.salesCount} ventes</span>
            </div>
            <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex-1 btn-ghost py-2 text-sm justify-center"><Pencil size={14} /> Modifier</button>
              <button onClick={() => handleDelete(product._id)} className="flex-1 btn-danger py-2 text-sm justify-center"><Trash2 size={14} /> Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}