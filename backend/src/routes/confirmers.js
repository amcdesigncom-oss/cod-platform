const express = require('express');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, adminOnly, async (req, res) => {
  const confirmers = await User.find({ role: { $in: ['confirmer', 'supervisor'] } }).select('-password');
  res.json(confirmers);
});

router.get('/:id/performance', auth, async (req, res) => {
  const confirmer = await User.findById(req.params.id).select('-password');
  res.json(confirmer);
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  const confirmer = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  res.json(confirmer);
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Confirmateur supprimé' });
});

module.exports = router;