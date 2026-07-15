const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, password, phone, role, assignedWilayas } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email déjà utilisé' });
    
    user = new User({ name, email, password, phone, role: role || 'confirmer', assignedWilayas });
    await user.save();
    
    res.status(201).json({ message: 'Compte créé', user: { id: user._id, name, email, role } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Identifiants incorrects' });
    if (!user.isActive) return res.status(403).json({ message: 'Compte désactivé' });
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Identifiants incorrects' });
    
    user.lastLogin = new Date();
    await user.save();
    
    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email, role: user.role, assignedWilayas: user.assignedWilayas }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

module.exports = router;