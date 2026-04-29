const db = require('../config/db');

const saveRefreshToken = async (id, userId, token, expiresAt) => {
  await db.query(
    'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
    [id, userId, token, expiresAt]
  );
};

const findRefreshToken = async (token) => {
  const [rows] = await db.query(
    'SELECT * FROM refresh_tokens WHERE token = ?', [token]
  );
  return rows[0];
};

const deleteRefreshToken = async (token) => {
  await db.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
};

const blacklistToken = async (id, token) => {
  await db.query(
    'INSERT INTO token_blacklist (id, token) VALUES (?, ?)',
    [id, token]
  );
};

const isBlacklisted = async (token) => {
  const [rows] = await db.query(
    'SELECT * FROM token_blacklist WHERE token = ?', [token]
  );
  return rows.length > 0;
};

module.exports = { saveRefreshToken, findRefreshToken, deleteRefreshToken, blacklistToken, isBlacklisted };