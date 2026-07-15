const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'confirmer', 'supervisor'], 
    default: 'confirmer' 
  },
  isActive: { type: Boolean, default: true },
  performance: {
    totalLeads: { type: Number, default: 0 },
    confirmed: { type: Number, default: 0 },
    noAnswer: { type: Number, default: 0 },
    notInterested: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  assignedWilayas: [{ type: String }],
  lastLogin: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);