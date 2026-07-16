const express = require('express');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/products - Liste avec filtres
router.get('/', auth, async (req, res) => {
  try {
    const { category, search, active } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (active !== undefined) query.isActive = active === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .select('-__v');
    
    // Récupérer les variantes pour chaque produit
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await ProductVariant.find({ product: product._id });
        return {
          ...product.toObject(),
          variants
        };
      })
    );
    
    res.json(productsWithVariants);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/products/:id - Détail avec variantes
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    
    const variants = await ProductVariant.find({ product: product._id });
    
    res.json({ ...product.toObject(), variants });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/products - Créer avec variantes
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { 
      name, description, shortDescription,
      basePrice, oldPrice,
      images, category, subcategory, tags,
      variantOptions, variants,
      metaTitle, metaDescription
    } = req.body;
    
    // Créer le produit parent
    const product = new Product({
      name, description, shortDescription,
      basePrice, oldPrice,
      images, category, subcategory, tags,
      variantOptions,
      metaTitle, metaDescription
    });
    
    await product.save();
    
    // Créer les variantes si fournies
    if (variants && variants.length > 0) {
      const variantDocs = variants.map(v => ({
        product: product._id,
        sku: v.sku || generateSKU(product.name, v.options),
        options: v.options,
        price: v.price || basePrice,
        stock: v.stock || 0,
        images: v.images || []
      }));
      
      await ProductVariant.insertMany(variantDocs);
    }
    
    // Récupérer le produit complet avec variantes
    const createdVariants = await ProductVariant.find({ product: product._id });
    
    res.status(201).json({
      ...product.toObject(),
      variants: createdVariants
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// PUT /api/products/:id - Modifier avec variantes
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { variants, ...productData } = req.body;
    
    // Mettre à jour le produit parent
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true }
    );
    
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    
    // Supprimer et recréer les variantes si fournies
    if (variants) {
      await ProductVariant.deleteMany({ product: product._id });
      
      const variantDocs = variants.map(v => ({
        product: product._id,
        sku: v.sku || generateSKU(product.name, v.options),
        options: v.options,
        price: v.price || product.basePrice,
        stock: v.stock || 0,
        images: v.images || []
      }));
      
      await ProductVariant.insertMany(variantDocs);
    }
    
    const updatedVariants = await ProductVariant.find({ product: product._id });
    
    res.json({ ...product.toObject(), variants: updatedVariants });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await ProductVariant.deleteMany({ product: req.params.id });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Produit et variantes supprimés' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Fonction utilitaire pour générer SKU
function generateSKU(productName, options) {
  const prefix = productName.substring(0, 3).toUpperCase();
  const optionCodes = Object.values(options).map(v => v.substring(0, 2).toUpperCase()).join('-');
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${optionCodes}-${random}`;
}

module.exports = router;