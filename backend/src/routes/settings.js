const express = require('express');
const Setting = require('../models/Setting');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) settings = await Setting.create({});
  res.json(settings);
});

router.put('/', auth, adminOnly, async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) settings = new Setting(req.body);
  else Object.assign(settings, req.body);
  await settings.save();
  res.json(settings);
});

module.exports = router;