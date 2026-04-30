const db = require('../config/db');

const createBooking = async (id, userId, fieldId, slotId, bookingDate) => {
  await db.query(
    'INSERT INTO bookings (id, user_id, field_id, slot_id, booking_date) VALUES (?, ?, ?, ?, ?)',
    [id, userId, fieldId, slotId, bookingDate]
  );
};

const findBookingById = async (id) => {
  const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
  return rows[0];
};

const findBookingsByUser = async (userId, page = 1, perPage = 10) => {
  const offset = (page - 1) * perPage;
  const [rows] = await db.query(
    'SELECT * FROM bookings WHERE user_id = ? LIMIT ? OFFSET ?',
    [userId, perPage, offset]
  );
  const [[{ total }]] = await db.query(
    'SELECT COUNT(*) as total FROM bookings WHERE user_id = ?',
    [userId]
  );
  return { data: rows, total, page, per_page: perPage };
};

const updateBookingStatus = async (id, status) => {
  await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
};

module.exports = { createBooking, findBookingById, findBookingsByUser, updateBookingStatus };