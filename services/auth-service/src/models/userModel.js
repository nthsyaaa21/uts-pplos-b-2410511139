const pool = require('../config/db');

const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async findByOAuth(provider, oauthId) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?',
      [provider, oauthId]
    );
    return rows[0];
  },

  async create(data) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, oauth_provider, oauth_id, avatar_url, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.name, data.email, data.password || null, data.oauth_provider || null,
       data.oauth_id || null, data.avatar_url || null, data.role || 'user']
    );
    return result.insertId;
  },

  async saveRefreshToken(userId, token, expiresAt) {
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
  },

  async findRefreshToken(token) {
    const [rows] = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    return rows[0];
  },

  async deleteRefreshToken(token) {
    await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
  },

  async blacklistToken(token) {
    await pool.query('INSERT INTO token_blacklist (token) VALUES (?)', [token]);
  },
};

module.exports = UserModel;