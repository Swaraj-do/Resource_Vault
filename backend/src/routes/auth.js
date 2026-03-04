const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const genToken = (id) => jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (await User.findOne({ email })) return res.status(409).json({ error: 'Email already registered' });
    const user = await User.create({ email, password });
    res.status(201).json({ token: genToken(user._id), user: { id: user._id, email: user.email } });
  } catch (err) {
    const msg = err.name === 'ValidationError' ? Object.values(err.errors)[0].message : 'Registration failed';
    res.status(400).json({ error: msg });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ token: genToken(user._id), user: { id: user._id, email: user.email } });
  } catch { res.status(500).json({ error: 'Login failed' }); }
});

router.get('/me', authenticateToken, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user._id, email: user.email } });
});

module.exports = router;
