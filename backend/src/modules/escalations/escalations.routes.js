const express = require('express');
const { protect, restrictTo } = require('../../middleware/auth');
const {
  getEscalations,
  getEscalationById,
  resolveEscalation
} = require('./escalations.controller');

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/', getEscalations);
router.get('/:id', getEscalationById);
router.patch('/:id/resolve', resolveEscalation);

module.exports = router;
