const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  wilaya: { type: String, required: true },
  commune: { type: String, required: true },
  address: { type: String },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
  totalPrice: { type: Number },
  status: {
    type: String,
    enum: [
      'pending', 'confirmed', 'no-answer', 'not-interested',
      'already-bought', 'wrong-number', 'cancelled', 'shipped', 'delivered', 'returned'
    ],
    default: 'pending'
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  callHistory: [{
    date: { type: Date, default: Date.now },
    confirmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String,
    notes: String
  }],
  source: { type: String, default: 'landing-page' },
  internalNotes: { type: String },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' }
}, { timestamps: true });

leadSchema.index({ status: 1, assignedTo: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);