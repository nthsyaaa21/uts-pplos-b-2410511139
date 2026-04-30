const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token)
    return res.status(401).json({ message: 'Token tidak ditemukan' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid atau expired' });
  }
};

module.exports = verifyToken;