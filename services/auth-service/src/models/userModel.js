const db = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

const createUser = async (id, name, email, hashedPassword, oauthProvider = null, oauthId = null, avatarUrl = null) => {
  await db.query(
    'INSERT INTO users (id, name, email, password, oauth_provider, oauth_id, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, email, hashedPassword, oauthProvider, oauthId, avatarUrl]
  );
};

const findByOAuthId = async (provider, oauthId) => {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?',
    [provider, oauthId]
  );
  return rows[0];
};

module.exports = { findByEmail, findById, createUser, findByOAuthId };