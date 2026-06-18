const express = require('express');
const { login } = require('./auth.controller');
const { loginLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

router.post('/login', loginLimiter, login);

module.exports = router;
