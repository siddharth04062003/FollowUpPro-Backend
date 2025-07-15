// Get user profile
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      title: user.title,
      linkedin: user.linkedin,
      profilePhoto: user.profilePhoto
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout (stateless, client should just delete token)
exports.logout = (req, res) => {
  res.json({ message: 'Logged out' });
};
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, title, linkedin } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    let profilePhoto = undefined;
    if (req.file) {
      profilePhoto = 'uploads/' + req.file.filename;
    }
    const user = await User.create({
      name,
      email,
      password: hashed,
      title,
      linkedin,
      profilePhoto
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        title: user.title,
        linkedin: user.linkedin,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'All fields required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        title: user.title,
        linkedin: user.linkedin,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 