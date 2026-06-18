const express = require('express');
const authRouter = require('../modules/auth/auth.routes');
const conversationsRouter = require('../modules/conversations/conversations.routes');
const documentsRouter = require('../modules/documents/documents.routes');
const escalationsRouter = require('../modules/escalations/escalations.routes');
const feedbackRouter = require('../modules/feedback/feedback.routes');
const analyticsRouter = require('../modules/analytics/analytics.routes');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/conversations', conversationsRouter);
router.use('/documents', documentsRouter);
router.use('/escalations', escalationsRouter);
router.use('/feedback', feedbackRouter);
router.use('/analytics', analyticsRouter);

module.exports = router;
