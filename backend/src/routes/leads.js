const express = require('express');
const Lead = require('../models/Lead');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// PUBLIC - Créer un lead depuis la landing page
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, phone, wilaya, commune, productId, quantity } = req.body;
    if (!firstName || !lastName || !phone || !wilaya || !commune || !productId) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    
    const totalPrice = product.price * (quantity || 1);
    
    // Attribution round-robin
    const confirmers = await User.find({ role: 'confirmer', isActive: true });
    let assignedTo = null;
    if (confirmers.length > 0) {
      const counts = await Promise.all(confirmers.map(async c => ({
        id: c._id,
        count: await Lead.countDocuments({ assignedTo: c._id, status: 'pending' })
      })));
      counts.sort((a, b) => a.count - b.count);
      assignedTo = counts[0].id;
    }
    
    const lead = new Lead({
      firstName, lastName, phone, wilaya, commune,
      product: productId, quantity: quantity || 1, totalPrice, assignedTo
    });
    await lead.save();
    
    if (assignedTo) {
      await User.findByIdAndUpdate(assignedTo, { $inc: { 'performance.totalLeads': 1 } });
    }
    
    res.status(201).json({ message: 'Commande reçue ! Nous vous contacterons bientôt.', leadId: lead._id });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PRIVATE - Liste des leads
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'confirmer') query.assignedTo = req.user.id;
    if (req.query.status) query.status = req.query.status;
    
    const leads = await Lead.find(query)
      .populate('product', 'name price')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead non trouvé' });
    
    if (req.user.role === 'confirmer' && lead.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Ce lead ne vous est pas assigné' });
    }
    
    lead.status = status;
    lead.callHistory.push({ confirmer: req.user.id, status, notes: notes || `Changé en ${status}` });
    await lead.save();
    
    // Update confirmer stats
    if (req.user.role === 'confirmer') {
      const confirmer = await User.findById(req.user.id);
      if (status === 'confirmed') confirmer.performance.confirmed++;
      else if (status === 'no-answer') confirmer.performance.noAnswer++;
      else if (status === 'not-interested') confirmer.performance.notInterested++;
      
      const total = confirmer.performance.confirmed + confirmer.performance.noAnswer + confirmer.performance.notInterested;
      if (total > 0) confirmer.performance.conversionRate = Math.round((confirmer.performance.confirmed / total) * 100);
      await confirmer.save();
    }
    
    res.json({ message: 'Statut mis à jour', lead });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;