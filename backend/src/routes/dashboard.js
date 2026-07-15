const express = require('express');
const Lead = require('../models/Lead');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', auth, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const thisWeek = new Date(today); thisWeek.setDate(thisWeek.getDate()-7);
    
    const totalLeads = await Lead.countDocuments();
    const todayLeads = await Lead.countDocuments({ createdAt: { $gte: today } });
    const confirmedLeads = await Lead.countDocuments({ status: 'confirmed' });
    const conversionRate = totalLeads > 0 ? Math.round((confirmedLeads/totalLeads)*100) : 0;
    
    const revenue = await Lead.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    const confirmerStats = await User.find({ role: 'confirmer' }).select('name performance');
    
    const dailyStats = await Lead.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, leads: { $sum: 1 }, confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } } } },
      { $sort: { _id: -1 } }, { $limit: 30 }
    ]);
    
    res.json({
      overview: { totalLeads, todayLeads, confirmedLeads, conversionRate, totalRevenue: revenue[0]?.total || 0 },
      confirmerStats,
      dailyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;