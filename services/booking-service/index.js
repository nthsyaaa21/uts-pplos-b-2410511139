const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

const bookingRoutes = require('./src/routes/bookingRoutes');
app.use('/bookings', bookingRoutes);

app.get('/health', (req, res) => res.json({ status: 'booking-service ok' }));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Booking service running on port ${PORT}`));