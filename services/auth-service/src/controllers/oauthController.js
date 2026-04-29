const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const UserModel = require('../models/userModel');
require('dotenv').config();

// Helper buat JWT
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );
}

const authController = {
  // POST /auth/register
  async register(req, res) {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(422).json({ message: 'Name, email, dan password wajib diisi' });
    }
    if (password.length < 6) {
      return res.status(422).json({ message: 'Password minimal 6 karakter' });
    }

    try {
      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'Email sudah terdaftar' });
      }

      const hashed = await bcrypt.hash(password, 10);
      const userId = await UserModel.create({ name, email, password: hashed, role });

      return res.status(201).json({
        message: 'Registrasi berhasil',
        data: { id: userId, name, email }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // POST /auth/login
  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ message: 'Email dan password wajib diisi' });
    }

    try {
      const user = await UserModel.findByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: 'Email atau password salah' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Email atau password salah' });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Simpan refresh token (expire 7 hari)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await UserModel.saveRefreshToken(user.id, refreshToken, expiresAt);

      return res.status(200).json({
        message: 'Login berhasil',
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: { id: user.id, name: user.name, email: user.email, role: user.role }
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // POST /auth/refresh
  async refresh(req, res) {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(422).json({ message: 'Refresh token wajib diisi' });
    }

    try {
      const stored = await UserModel.findRefreshToken(refresh_token);
      if (!stored) {
        return res.status(401).json({ message: 'Refresh token tidak valid atau expired' });
      }

      jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Refresh token tidak valid' });

        const user = await UserModel.findById(decoded.id);
        const newAccessToken = generateAccessToken(user);

        return res.status(200).json({
          message: 'Token diperbarui',
          data: { access_token: newAccessToken }
        });
      });
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // POST /auth/logout
  async logout(req, res) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { refresh_token } = req.body;

    if (!token) {
      return res.status(422).json({ message: 'Token wajib diisi' });
    }

    try {
      await UserModel.blacklistToken(token);
      if (refresh_token) {
        await UserModel.deleteRefreshToken(refresh_token);
      }

      return res.status(200).json({ message: 'Logout berhasil' });
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // GET /auth/me
  async me(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

      return res.status(200).json({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
          oauth_provider: user.oauth_provider
        }
      });
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // GET /auth/github — redirect ke GitHub
  githubRedirect(req, res) {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,
      scope: 'user:email',
    });
    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
  },

  // GET /auth/github/callback — GitHub balik ke sini
  async githubCallback(req, res) {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: 'Code dari GitHub tidak ada' });
    }

    try {
      // Tukar code dengan access token GitHub
      const tokenRes = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        { headers: { Accept: 'application/json' } }
      );

      const githubToken = tokenRes.data.access_token;

      // Ambil data user dari GitHub
      const userRes = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${githubToken}` },
      });

      // Ambil email (GitHub kadang private)
      const emailRes = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${githubToken}` },
      });
      const primaryEmail = emailRes.data.find(e => e.primary)?.email;

      const githubUser = userRes.data;

      // Cek apakah user sudah ada
      let user = await UserModel.findByOAuth('github', String(githubUser.id));

      if (!user && primaryEmail) {
        user = await UserModel.findByEmail(primaryEmail);
      }

      if (!user) {
        // Buat user baru
        const newId = await UserModel.create({
          name: githubUser.name || githubUser.login,
          email: primaryEmail || `github_${githubUser.id}@placeholder.com`,
          oauth_provider: 'github',
          oauth_id: String(githubUser.id),
          avatar_url: githubUser.avatar_url,
        });
        user = await UserModel.findById(newId);
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await UserModel.saveRefreshToken(user.id, refreshToken, expiresAt);

      return res.status(200).json({
        message: 'Login GitHub berhasil',
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar_url: user.avatar_url,
            oauth_provider: 'github'
          }
        }
      });
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Gagal login via GitHub' });
    }
  },
};

module.exports = authController;