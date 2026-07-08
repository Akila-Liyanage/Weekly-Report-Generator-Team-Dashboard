const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegistration } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', login);
router.get('/me', protect, me);

module.exports = router;
