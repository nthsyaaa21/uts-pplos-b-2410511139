const jwt = require('jsonwebtoken');
const { isBlacklisted } = require('../models/tokenModel');
require('dotenv').config();

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token)
    return res.status(401).json({ message: 'Token tidak ditemukan' });

  const blacklisted = await isBlacklisted(token);
  if (blacklisted)
    return res.status(401).json({ message: 'Token sudah tidak valid' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid atau expired' });
  }
};

module.exports = verifyToken;