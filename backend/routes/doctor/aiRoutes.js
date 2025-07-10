const express = require('express');
const rateLimit = require('express-rate-limit');
const { chat, uploadReportForAI } = require('../../controller/chatController');
const verifyJwt = require('../../middleware/auth');

const router = express.Router();

// Rate limiting configuration
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many AI requests. Please try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 uploads per windowMs
  message: {
    success: false,
    message: 'Too many file uploads. Please try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/chat', verifyJwt, chatLimiter, chat);
router.post('/upload-report', verifyJwt, uploadLimiter, uploadReportForAI);

module.exports = router;