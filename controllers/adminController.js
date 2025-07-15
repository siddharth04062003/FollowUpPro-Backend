const Admin = require('../models/Admin');
const User = require('../models/User');
const Job = require('../models/Job');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Only one admin, credentials from env
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USERNAME) return res.status(401).json({ error: 'Invalid credentials' });
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid credentials' });
  // Optionally hash and compare for more security
  const token = jwt.sign({ admin: true, username }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
};

exports.analytics = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const jobCount = await Job.countDocuments();
    const jobsByStatus = await Job.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const jobsByDate = await Job.aggregate([
      { $group: { _id: { $substr: ['$appliedDate', 0, 10] }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ userCount, jobCount, jobsByStatus, jobsByDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
