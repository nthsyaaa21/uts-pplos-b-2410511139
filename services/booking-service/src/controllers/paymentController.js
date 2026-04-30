const { v4: uuidv4 } = require('uuid');
const paymentModel = require('../models/paymentModel');
const bookingModel = require('../models/bookingModel');

const payFull = async (req, res) => {
  try {
    const { booking_id, amount } = req.body;
    if (!booking_id || !amount) {
      return res.status(400).json({ message: 'booking_id dan amount wajib diisi' });
    }

    const booking = await bookingModel.findBookingById(booking_id);
    if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });

    const paymentId = uuidv4();
    await paymentModel.createPayment(paymentId, booking_id, 'full', amount);
    await paymentModel.updatePaymentStatus(paymentId, 'paid');
    await bookingModel.updateBookingStatus(booking_id, 'confirmed');

    return res.status(200).json({ message: 'Pembayaran lunas berhasil' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const payments = await paymentModel.findPaymentByBooking(booking_id);
    return res.status(200).json(payments);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { payFull, getPayments };