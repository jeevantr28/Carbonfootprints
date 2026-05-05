const express = require('express');
const router = express.Router();
const { getSummaryStats, getStatsByCategory, getStatsTrend } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getSummaryStats);
router.get('/by-category', protect, getStatsByCategory);
router.get('/trend', protect, getStatsTrend);

module.exports = router;
