const express = require('express');
const { protect, restrictTo } = require('../../middleware/auth');
const {
  submitFeedback,
  getFeedback,
  getNegativeFeedback
} = require('./feedback.controller');

const router = express.Router();

router.use(protect);

router.post('/', submitFeedback);
router.get('/', restrictTo('ADMIN'), getFeedback);
router.get('/negative', restrictTo('ADMIN'), getNegativeFeedback);

module.exports = router;
