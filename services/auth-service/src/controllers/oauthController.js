const axios = require('axios');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const userModel = require('../models/userModel');
const tokenModel = require('../models/tokenModel');
require('dotenv').config();

const githubRedirect = (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
  res.redirect(url);
};

const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;

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

    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${githubToken}` },
    });

    const emailRes = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${githubToken}` },
    });

    const primaryEmail = emailRes.data.find(e => e.primary)?.email;
    const githubUser = userRes.data;

    let user = await userModel.findByOAuthId('github', String(githubUser.id));

    if (!user) {
      const id = uuidv4();
      await userModel.createUser(
        id,
        githubUser.name || githubUser.login,
        primaryEmail,
        null,
        'github',
        String(githubUser.id),
        githubUser.avatar_url
      );
      user = await userModel.findById(id);
    }

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

    return res.status(200).json({ accessToken, refreshToken, user: { name: user.name, email: user.email, avatar: user.avatar_url } });
  } catch (err) {
    return res.status(500).json({ message: 'OAuth error', error: err.message });
  }
};

module.exports = { githubRedirect, githubCallback };