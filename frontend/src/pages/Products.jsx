import { useState, useRef } from 'react'
import { useProducts, createProduct, updateProduct, deleteProduct } from '../hooks/useApi'
import { Plus, Pencil, Trash2, X, Upload, Image as ImageIcon, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'

const CATEGORIES = [
  'Vêtements',
  'Chaussures',
  'Accessoires',
  'Montres',
  'Sacs',
  'Bijoux',
  'Électronique',
  'Maison'
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
const COLORS = [
  { name: 'Noir', hex: '#000000' },
  { name: 'Blanc', hex: '#FFFFFF' },
  { name: 'Rouge', hex: '#EF4444' },
  { name: 'Bleu', hex: '#3B82F6' },
  { name: 'Vert', hex: '#10B981' },
  { name: 'Jaune', hex: '#F59E0B' },
  { name: 'Gris', hex: '#6B7280' },
  { name: 'Marron', hex: '#92400E' },
  { name: 'Rose', hex: '#EC4899' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Beige', hex: '#D4C4A8' }
]

export default function Products() {
  const { data: products, loading, refetch } = useProducts()
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [activeSection, setActiveSection] = useState('basic')
  
  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    basePrice: '',
    oldPrice: '',
    category: '',
    tags: '',
    images: [],
    variantOptions: [
      { name: 'Taille', values: [] },
      { name: 'Couleur', values: [] }
    ],
    variants: []
  })
  
  const [previewImages, setPreviewImages] = useState([])
  const fileInputRef = useRef(null)

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      basePrice: '',
      oldPrice: '',
      category: '',
      tags: '',
      images: [],
      variantOptions: [
        { name: 'Taille', values: [] },
        { name: 'Couleur', values: [] }
      ],
      variants: []
    })
    setPreviewImages([])
    setEditingProduct(null)
    setActiveSection('basic')
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      basePrice: product.basePrice || '',
      oldPrice: product.oldPrice || '',
      category: product.category || '',
      tags: product.tags?.join(', ') || '',
      images: product.images || [],
      variantOptions: product.variantOptions || [
        { name: 'Taille', values: [] },
        { name: 'Couleur', values: [] }
      ],
      variants: product.variants || []
    })
    setPreviewImages(product.images || [])
    setShowForm(true)
    setActiveSection('basic')
  }

  // Générer les variantes automatiquement
  const generateVariants = () => {
    const sizes = formData.variantOptions.find(v => v.name === 'Taille')?.values || []
    const colors = formData.variantOptions.find(v => v.name === 'Couleur')?.values || []
    
    if (sizes.length === 0 && colors.length === 0) return []
    
    const variants = []
    
    if (sizes.length === 0) {
      colors.forEach(color => {
        variants.push({
          sku: '',
          options: { Couleur: color },
          price: '',
          stock: ''
        })
      })
    } else if (colors.length === 0) {
      sizes.forEach(size => {
        variants.push({
          sku: '',
          options: { Taille: size },
          price: '',
          stock: ''
        })
      })
    } else {
      sizes.forEach(size => {
        colors.forEach(color => {
          variants.push({
            sku: '',
            options: { Taille: size, Couleur: color },
            price: '',
            stock: ''
          })
        })
      })
    }
    
    return variants
  }

  const handleGenerateVariants = () => {
    const newVariants = generateVariants()
    setFormData({ ...formData, variants: newVariants })
    setActiveSection('variants')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const productData = {
      ...formData,
      basePrice: Number(formData.basePrice),
      oldPrice: Number(formData.oldPrice) || 0,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      variants: formData.variants.map(v => ({
        ...v,
        price: Number(v.price) || Number(formData.basePrice),
        stock: Number(v.stock) || 0
      }))
    }
    
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, productData)
      } else {
        await createProduct(productData)
      }
      resetForm()
      setShowForm(false)
      refetch()
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.message || 'Problème de sauvegarde'))
    }
  }

  const toggleVariantOption = (optionName, value) => {
    setFormData(prev => {
      const newOptions = prev.variantOptions.map(opt => {
        if (opt.name === optionName) {
          const hasValue = opt.values.includes(value)
          return {
            ...opt,
            values: hasValue 
              ? opt.values.filter(v => v !== value)
              : [...opt.values, value]
          }
        }
        return opt
      })
      return { ...prev, variantOptions: newOptions }
    })
  }

  const updateVariant = (index, field, value) => {
    setFormData(prev => {
      const newVariants = [...prev.variants]
      newVariants[index] = { ...newVariants[index], [field]: value }
      return { ...prev, variants: newVariants }
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit et toutes ses variantes ?')) return
    await deleteProduct(id)
    refetch()
  }

  // Simulation upload image (en vrai, utiliser Cloudinary/S3)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map(file => URL.createObjectURL(file))
    setPreviewImages([...previewImages, ...newImages])
    setFormData({ ...formData, images: [...formData.images, ...newImages] })
  }

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mes Produits</h1>
          <p className="text-gray-400 text-sm">Gérez votre catalogue professionnel</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary">
          <Plus size={20} /> Ajouter un Produit
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card space-y-6 animate-fade-in">
          <div className="flex justify-between items-center border-b border-dark-600 pb-4">
            <h2 className="text-xl font-bold">
              {editingProduct ? '✏️ Modifier le Produit' : '➕ Nouveau Produit'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Navigation sections */}
          <div className="flex gap-2 border-b border-dark-600 pb-2">
            {[
              { id: 'basic', label: 'Informations', icon: '📋' },
              { id: 'images', label: 'Photos', icon: '📸' },
              { id: 'variants', label: 'Variantes', icon: '🎨' },
              { id: 'inventory', label: 'Inventaire', icon: '📦' }
            ].map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === section.id 
                    ? 'bg-accent text-white' 
                    : 'text-gray-400 hover:bg-dark-700'
                }`}
              >
                {section.icon} {section.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECTION: Informations de base */}
            {activeSection === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nom du produit *</label>
                  <input 
                    className="input-field" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="ex: T-shirt Premium Coton Bio"
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Prix (DA) *</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={formData.basePrice} 
                      onChange={e => setFormData({...formData, basePrice: e.target.value})} 
                      placeholder="2500"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Ancien prix (DA)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={formData.oldPrice} 
                      onChange={e => setFormData({...formData, oldPrice: e.target.value})} 
                      placeholder="3500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Catégorie *</label>
                  <select 
                    className="input-field"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Choisir une catégorie...</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description courte</label>
                  <input 
                    className="input-field" 
                    value={formData.shortDescription} 
                    onChange={e => setFormData({...formData, shortDescription: e.target.value})} 
                    placeholder="Description rapide pour les listes (160 caractères max)"
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.shortDescription?.length || 0}/160</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description complète *</label>
                  <textarea 
                    className="input-field" 
                    rows={6}
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    placeholder="Décrivez le produit en détail : matériaux, entretien, particularités..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tags (séparés par des virgules)</label>
                  <input 
                    className="input-field" 
                    value={formData.tags} 
                    onChange={e => setFormData({...formData, tags: e.target.value})} 
                    placeholder="été, coton, premium, tendance, homme..."
                  />
                </div>
              </div>
            )}

            {/* SECTION: Photos */}
            {activeSection === 'images' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Photos du produit</label>
                  <div className="grid grid-cols-4 gap-4">
                    {previewImages.map((img, i) => (
                      <div key={i} className="relative aspect-square bg-dark-700 rounded-xl overflow-hidden group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => {
                            setPreviewImages(previewImages.filter((_, idx) => idx !== i))
                            setFormData({...formData, images: formData.images.filter((_, idx) => idx !== i)})
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square bg-dark-700 border-2 border-dashed border-dark-600 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-accent hover:border-accent transition-all"
                    >
                      <Upload size={32} />
                      <span className="text-xs mt-2">Ajouter</span>
                    </button>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 En production, connectez Cloudinary ou AWS S3 pour l'hébergement d'images
                  </p>
                </div>
              </div>
            )}

            {/* SECTION: Variantes */}
            {activeSection === 'variants' && (
              <div className="space-y-6">
                <div className="bg-dark-700/50 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-lg">🎨 Options de variantes</h3>
                  
                  {/* Tailles */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Tailles disponibles</label>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleVariantOption('Taille', size)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.variantOptions.find(v => v.name === 'Taille')?.values.includes(size)
                              ? 'bg-accent text-white'
                              : 'bg-dark-700 text-gray-400 border border-dark-600 hover:border-accent'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Couleurs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Couleurs disponibles</label>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map(color => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => toggleVariantOption('Couleur', color.name)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.variantOptions.find(v => v.name === 'Couleur')?.values.includes(color.name)
                              ? 'bg-accent text-white'
                              : 'bg-dark-700 text-gray-400 border border-dark-600 hover:border-accent'
                          }`}
                        >
                          <span 
                            className="w-4 h-4 rounded-full border border-gray-500"
                            style={{ backgroundColor: color.hex }}
                          />
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateVariants}
                    className="btn-primary w-full justify-center"
                  >
                    ⚡ Générer les combinaisons de variantes
                  </button>
                </div>

                {/* Tableau des variantes */}
                {formData.variants.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">📦 {formData.variants.length} variantes générées</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-xs text-gray-500 uppercase">
                            <th className="pb-3">Variante</th>
                            <th className="pb-3">SKU</th>
                            <th className="pb-3">Prix (DA)</th>
                            <th className="pb-3">Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.variants.map((variant, idx) => (
                            <tr key={idx} className="border-t border-dark-600">
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {Object.entries(variant.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3">
                                <input 
                                  className="input-field py-1 px-2 text-sm w-32"
                                  value={variant.sku}
                                  onChange={e => updateVariant(idx, 'sku', e.target.value)}
                                  placeholder="SKU-001"
                                />
                              </td>
                              <td className="py-3">
                                <input 
                                  type="number"
                                  className="input-field py-1 px-2 text-sm w-24"
                                  value={variant.price}
                                  onChange={e => updateVariant(idx, 'price', e.target.value)}
                                  placeholder={formData.basePrice}
                                />
                              </td>
                              <td className="py-3">
                                <input 
                                  type="number"
                                  className="input-field py-1 px-2 text-sm w-20"
                                  value={variant.stock}
                                  onChange={e => updateVariant(idx, 'stock', e.target.value)}
                                  placeholder="0"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION: Inventaire (récap) */}
            {activeSection === 'inventory' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">📊 Récapitulatif</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-dark-700 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-accent">{formData.variants.length || 0}</p>
                    <p className="text-sm text-gray-400">Variantes</p>
                  </div>
                  <div className="bg-dark-700 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">
                      {formData.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)}
                    </p>
                    <p className="text-sm text-gray-400">Stock total</p>
                  </div>
                  <div className="bg-dark-700 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">{formData.images.length}</p>
                    <p className="text-sm text-gray-400">Photos</p>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4 border-t border-dark-600">
              <button type="submit" className="btn-primary">
                💾 {editingProduct ? 'Mettre à jour' : 'Enregistrer le Produit'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des produits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products?.map(product => (
          <div key={product._id} className="card hover:border-accent/50 transition-all group">
            <div className="h-48 bg-gradient-to-br from-dark-700 to-dark-600 rounded-xl flex items-center justify-center overflow-hidden relative">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={48} className="text-gray-600" />
              )}
              {product.featured && (
                <span className="absolute top-2 left-2 bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded-lg">
                  ⭐ POPULAIRE
                </span>
              )}
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{product.category}</p>
                  <h3 className="font-semibold mt-1 line-clamp-2">{product.name}</h3>
                </div>
              </div>
              
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-xl font-bold text-accent">{product.basePrice?.toLocaleString()} DA</span>
                {product.oldPrice > 0 && (
                  <span className="text-sm text-gray-500 line-through">{product.oldPrice?.toLocaleString()} DA</span>
                )}
              </div>
              
              <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                <span>{product.variants?.length || 0} variantes</span>
                <span className={product.variants?.some(v => v.stock > 0) ? 'text-emerald-400' : 'text-red-400'}>
                  {product.variants?.some(v => v.stock > 0) ? 'En stock' : 'Rupture'}
                </span>
              </div>
              
              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(product)} className="flex-1 btn-ghost py-2 text-sm justify-center">
                  <Pencil size={14} /> Modifier
                </button>
                <button onClick={() => handleDelete(product._id)} className="flex-1 btn-danger py-2 text-sm justify-center">
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}