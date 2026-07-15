const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  brandName: { type: String, default: 'Ma Boutique' },
  brandLogo: { type: String, default: '👕' },
  brandDescription: { type: String },
  contactPhone: { type: String },
  contactEmail: { type: String },
  facebookPage: { type: String },
  delivery: {
    freeWilayas: [{ type: String }],
    deliveryFee: { type: Number, default: 500 },
    estimatedDays: { type: String, default: '24-48h' }
  },
  tracking: {
    facebookPixel: { type: String },
    googleAnalytics: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);