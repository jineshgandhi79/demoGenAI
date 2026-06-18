const express = require('express');
const { protect, restrictTo } = require('../../middleware/auth');
const {
  getOverview,
  getTopUnanswered,
  getEscalationTopics
} = require('./analytics.controller');

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/overview', getOverview);
router.get('/top-unanswered', getTopUnanswered);
router.get('/escalation-topics', getEscalationTopics);

module.exports = router;
