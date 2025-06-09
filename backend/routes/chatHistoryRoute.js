const express = require('express');
const router = express.Router();
const verifyJwt = require('../middleware/auth');
const { createChat, getAllChats, getMessagesByChatId, deleteChatById, updateChatById, testHDBQuota, deleteMessageById } = require('../controller/chatHistoryController');

router.post('/create-chat', verifyJwt, createChat);
router.get('/get-all-chats', verifyJwt, getAllChats);
router.get('/get-messages-by-chat-id/:chatId', verifyJwt, getMessagesByChatId);
router.post('/delete-chat-by-id', verifyJwt, deleteChatById);
router.put('/update-chat-by-id/:chatId', verifyJwt, updateChatById);
router.delete('/delete-message/:chatId/:messageId', verifyJwt, deleteMessageById);
router.post('/test-hdb', testHDBQuota);

module.exports = router;