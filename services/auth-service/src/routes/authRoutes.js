const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const oauthController = require('../controllers/oauthController');
const verifyToken = require('../middleware/jwtMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', verifyToken, authController.logout);
router.get('/profile', verifyToken, authController.getProfile);
router.get('/oauth/github', oauthController.githubRedirect);
router.get('/oauth/github/callback', oauthController.githubCallback);

module.exports = router;