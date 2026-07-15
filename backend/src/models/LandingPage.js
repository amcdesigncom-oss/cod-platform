const mongoose = require('mongoose');

const landingPageSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  config: {
    style: { type: String, default: 'modern' },
    primaryColor: { type: String, default: '#6366f1' },
    offerText: { type: String, default: '🚚 Livraison Gratuite + Paiement à la Livraison' }
  },
  generatedContent: {
    headline: String,
    subheadline: String,
    benefits: [String],
    testimonials: [{
      name: String,
      text: String,
      rating: Number,
      wilaya: String
    }],
    faq: [{ question: String, answer: String }],
    urgencyText: String
  },
  views: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('LandingPage', landingPageSchema);