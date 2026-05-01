const { v4: uuidv4 } = require('uuid');
const paymentModel = require('../models/paymentModel');
const bookingModel = require('../models/bookingModel');

const payDP = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, payment_method } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount wajib diisi' });
    }

    const booking = await bookingModel.findBookingById(id);
    if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });

    if (booking.status !== 'pending') {
      return res.status(409).json({ message: 'Booking sudah dibayar atau dibatalkan' });
    }

    const paymentId = uuidv4();
    await paymentModel.createPayment(paymentId, id, 'dp', amount);
    await paymentModel.updatePaymentStatus(paymentId, 'paid');
    await bookingModel.updateBookingStatus(id, 'dp_paid');

    return res.status(200).json({ message: 'Pembayaran DP berhasil', payment_id: paymentId });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const payFull = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, payment_method } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount wajib diisi' });
    }

    const booking = await bookingModel.findBookingById(id);
    if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });

    if (booking.status === 'cancelled') {
      return res.status(409).json({ message: 'Booking sudah dibatalkan' });
    }

    const paymentId = uuidv4();
    await paymentModel.createPayment(paymentId, id, 'full', amount);
    await paymentModel.updatePaymentStatus(paymentId, 'paid');
    await bookingModel.updateBookingStatus(id, 'confirmed');

    return res.status(200).json({ message: 'Pembayaran lunas berhasil', payment_id: paymentId });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const { id } = req.params;
    const payments = await paymentModel.findPaymentByBooking(id);
    return res.status(200).json(payments);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { payDP, payFull, getPayments };