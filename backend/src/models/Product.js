const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  category: { type: String, required: true },
  images: [{ type: String }],
  features: [{ type: String }],
  isActive: { type: Boolean, default: true },
  salesCount: { type: Number, default: 0 },
  landingPageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);