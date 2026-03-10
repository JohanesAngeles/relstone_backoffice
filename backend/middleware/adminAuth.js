// middleware/adminAuth.js
const jwt = require('jsonwebtoken');

const protectAdmin = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return res.status(401).json({ message: 'Not authorized. No token.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token must have role: 'admin' (set in adminAuth.js verify-captcha)
    if (decoded.role !== 'admin')
      return res.status(401).json({ message: 'Admin access only.' });

    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized. Invalid token.' });
  }
};

module.exports = { protectAdmin };