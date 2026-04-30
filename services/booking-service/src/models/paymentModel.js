const db = require('../config/db');

const createPayment = async (id, bookingId, type, amount) => {
  await db.query(
    'INSERT INTO payments (id, booking_id, type, amount) VALUES (?, ?, ?, ?)',
    [id, bookingId, type, amount]
  );
};

const findPaymentByBooking = async (bookingId) => {
  const [rows] = await db.query(
    'SELECT * FROM payments WHERE booking_id = ?', [bookingId]
  );
  return rows;
};

const updatePaymentStatus = async (id, status) => {
  const paidAt = status === 'paid' ? new Date() : null;
  await db.query(
    'UPDATE payments SET status = ?, paid_at = ? WHERE id = ?',
    [status, paidAt, id]
  );
};

module.exports = { createPayment, findPaymentByBooking, updatePaymentStatus };