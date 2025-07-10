const express = require('express');
const router = express.Router();
const { getDashboardStats, getTopBookingsForToday } = require('../../controller/dashboardController');
const verifyJwt = require('../../middleware/auth');

router.get('/stats', verifyJwt, getDashboardStats);
router.get('/top-bookings', verifyJwt, getTopBookingsForToday);

module.exports = router;