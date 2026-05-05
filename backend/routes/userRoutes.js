const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserGoal } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile').get(protect, getUserProfile);
router.route('/goal').put(protect, updateUserGoal);

module.exports = router;
