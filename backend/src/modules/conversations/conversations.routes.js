const express = require('express');
const { protect } = require('../../middleware/auth');
const {
  createConversation,
  getConversations,
  getConversationById,
  deleteConversation
} = require('./conversations.controller');
const messagesRouter = require('../messages/messages.routes');

const router = express.Router();

router.use(protect);

router.post('/', createConversation);
router.get('/', getConversations);
router.get('/:conversationId', getConversationById);
router.delete('/:conversationId', deleteConversation);

router.use('/:conversationId/messages', messagesRouter);

module.exports = router;
