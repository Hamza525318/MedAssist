const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createSlot,
  getSlots,
  updateSlot,
  deleteSlot
} = require('../controller/slotController');

// All routes require authentication
router.use(protect);

// Doctor only routes
router.route('/')
  .post(authorize('doctor'), createSlot)
  .get(getSlots);

router.route('/:id')
  .put(authorize('doctor'), updateSlot)
  .delete(authorize('doctor'), deleteSlot);

module.exports = router; 