const router = require('express').Router();
const ContactMessage = require('../models/ContactMessage');

// ✅ TEST route (so you can confirm it works in browser)
router.get('/test', (req, res) => {
  res.json({ ok: true, message: 'contact route is working' });
});

// POST /api/contact
router.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject) {
      return res.status(400).json({ message: 'Name, email, and subject are required.' });
    }

    const doc = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    res.status(201).json({ message: 'Message submitted successfully.', id: doc._id });
  } catch (err) {
    next(err);
  }
});

// GET /api/contact (admin view)
router.get('/', async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(100);
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

module.exports = router;