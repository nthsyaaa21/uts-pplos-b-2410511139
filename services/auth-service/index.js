const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

const authRoutes = require('./src/routes/authRoutes');
app.use('/auth', authRoutes);

app.get('/health', (req, res) => res.json({ status: 'auth-service ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));