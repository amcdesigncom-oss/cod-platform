const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sku: { type: String, required: true, unique: true },
  options: { type: Map, of: String }, // { Taille: "S", Couleur: "Rouge" }
  price: { type: Number }, // null si même prix que produit parent
  stock: { type: Number, default: 0 },
  images: [{ type: String }], // Images spécifiques à cette variante
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ProductVariant', productVariantSchema);