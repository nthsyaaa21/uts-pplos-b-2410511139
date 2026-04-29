const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const userModel = require('../models/userModel');
const tokenModel = require('../models/tokenModel');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Semua field wajib diisi' });

    const existing = await userModel.findByEmail(email);
    if (existing)
      return res.status(409).json({ message: 'Email sudah terdaftar' });

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await userModel.createUser(id, name, email, hashed);

    return res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email dan password wajib diisi' });

    const user = await userModel.findByEmail(email);
    if (!user)
      return res.status(401).json({ message: 'Email atau password salah' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Email atau password salah' });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await tokenModel.saveRefreshToken(uuidv4(), user.id, refreshToken, expiresAt);

    return res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: 'Refresh token wajib diisi' });

    const stored = await tokenModel.findRefreshToken(refreshToken);
    if (!stored)
      return res.status(401).json({ message: 'Refresh token tidak valid' });

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).json({ accessToken });
  } catch (err) {
    return res.status(401).json({ message: 'Refresh token expired atau tidak valid' });
  }
};

const logout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token)
      return res.status(400).json({ message: 'Token wajib disertakan' });

    await tokenModel.blacklistToken(uuidv4(), token);
    const { refreshToken } = req.body;
    if (refreshToken) await tokenModel.deleteRefreshToken(refreshToken);

    return res.status(200).json({ message: 'Logout berhasil' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    const { password, ...profile } = user;
    return res.status(200).json(profile);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login, refresh, logout, getProfile };