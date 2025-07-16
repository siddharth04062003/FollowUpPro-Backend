const User = require('../models/User');
const Job = require('../models/Job');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Only one admin, credentials from env
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { admin: true, username }, 
      process.env.JWT_SECRET || 'fallback-secret', 
      { expiresIn: '1d' }
    );
    
    res.json({ token });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.analytics = async (req, res) => {
  try {
    // Verify admin token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (tokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (!decoded.admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Fetch analytics data
    const userCount = await User.countDocuments();
    const jobCount = await Job.countDocuments();
    
    const jobsByStatus = await Job.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Fixed date aggregation - handle different date formats
    const jobsByDate = await Job.aggregate([
      {
        $addFields: {
          dateString: {
            $cond: {
              if: { $type: '$appliedDate' },
              then: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: {
                    $cond: {
                      if: { $eq: [{ $type: '$appliedDate' }, 'string'] },
                      then: { $dateFromString: { dateString: '$appliedDate' } },
                      else: '$appliedDate'
                    }
                  }
                }
              },
              else: null
            }
          }
        }
      },
      { $match: { dateString: { $ne: null } } },
      { $group: { _id: '$dateString', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 30 } // Limit to last 30 days
    ]);
    
    res.json({ 
      userCount, 
      jobCount, 
      jobsByStatus, 
      jobsByDate 
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
};

// Optional: Add middleware for admin authentication
exports.authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    if (!decoded.admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};