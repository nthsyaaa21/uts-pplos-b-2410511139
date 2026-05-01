const { v4: uuidv4 } = require('uuid');
const bookingModel = require('../models/bookingModel');
const paymentModel = require('../models/paymentModel');
const axios = require('axios');
require('dotenv').config();

const createBooking = async (req, res) => {
  try {
    const { field_id, slot_id, booking_date, dp_amount } = req.body;
    const userId = req.user.id;

    if (!field_id || !slot_id || !booking_date || !dp_amount) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    try {
      await axios.get(`${process.env.FIELD_SERVICE_URL}/fields/${field_id}`);
    } catch (err) {
      return res.status(404).json({ message: 'Lapangan tidak ditemukan' });
    }

    const bookingId = uuidv4();
    await bookingModel.createBooking(bookingId, userId, field_id, slot_id, booking_date);

    const paymentId = uuidv4();
    await paymentModel.createPayment(paymentId, bookingId, 'dp', dp_amount);

    return res.status(201).json({ message: 'Booking berhasil', booking_id: bookingId });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const result = await bookingModel.findBookingsByUser(userId, page, perPage);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await bookingModel.findBookingById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });
    return res.status(200).json(booking);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await bookingModel.findBookingById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });
    await bookingModel.updateBookingStatus(req.params.id, 'cancelled');
    return res.status(200).json({ message: 'Booking dibatalkan' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking };