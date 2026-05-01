const pool = require('../config/db');

const bookingModel = {
  async createBooking(id, userId, fieldId, slotId, bookingDate) {
    const [result] = await pool.query(
      `INSERT INTO bookings (id, user_id, field_id, slot_id, booking_date, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [id, userId, fieldId, slotId, bookingDate]
    );
    return result;
  },

  async findBookingsByUser(userId, page, perPage) {
    const offset = (page - 1) * perPage;
    const [rows] = await pool.query(
      `SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [userId, perPage, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM bookings WHERE user_id = ?`,
      [userId]
    );
    return {
      data: rows,
      pagination: { page, per_page: perPage, total, total_pages: Math.ceil(total / perPage) }
    };
  },

  async findBookingById(id) {
    const [rows] = await pool.query(
      `SELECT * FROM bookings WHERE id = ?`, [id]
    );
    return rows[0];
  },

  async updateBookingStatus(id, status) {
    await pool.query(
      `UPDATE bookings SET status = ? WHERE id = ?`, [status, id]
    );
  }
};

module.exports = bookingModel;