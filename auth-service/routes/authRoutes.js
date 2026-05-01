const express = require('express');
const router = express.Router();
const { register, login, verify } = require('../controllers/authController');

// Публічні маршрути
router.post('/register', register);
router.post('/login', login);

// Внутрішній маршрут — для перевірки токена іншими сервісами
router.get('/verify', verify);

module.exports = router;