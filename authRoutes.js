const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/signup', authController.getSignupPage);
router.post('/signup', authController.signup);
router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);

module.exports = router;
