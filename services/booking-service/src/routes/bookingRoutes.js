const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const paymentController = require('../controllers/paymentController');
const verifyToken = require('../middleware/jwtMiddleware');

router.post('/', verifyToken, bookingController.createBooking);
router.get('/', verifyToken, bookingController.getMyBookings);
router.get('/:id', verifyToken, bookingController.getBookingById);
router.delete('/:id', verifyToken, bookingController.cancelBooking);
router.post('/payment/full', verifyToken, paymentController.payFull);
router.get('/payment/:booking_id', verifyToken, paymentController.getPayments);

module.exports = router;