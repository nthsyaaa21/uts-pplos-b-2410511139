const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  // Cek apakah token di-blacklist
  try {
    const [rows] = await pool.query(
      'SELECT id FROM token_blacklist WHERE token = ?',
      [token]
    );
    if (rows.length > 0) {
      return res.status(401).json({ message: 'Token sudah tidak valid (logout)' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Error cek blacklist' });
  }

  // Verifikasi token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token tidak valid atau sudah expired' });
    }
    req.user = user;
    next();
  });
};

module.exports = { verifyToken };