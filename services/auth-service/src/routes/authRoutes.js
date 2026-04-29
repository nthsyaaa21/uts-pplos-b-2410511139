const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', verifyToken, authController.logout);
router.get('/me', verifyToken, authController.me);

// GitHub OAuth
router.get('/github', authController.githubRedirect);
router.get('/github/callback', authController.githubCallback);

module.exports = router;