const express = require('express');
const { protect } = require('../../middleware/auth');
const { getMessages, createMessage } = require('./messages.controller');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/', getMessages);
router.post('/', createMessage);

module.exports = router;
