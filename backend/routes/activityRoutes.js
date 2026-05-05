const express = require('express');
const router = express.Router();
const { getActivities, createActivity, updateActivity, deleteActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getActivities)
  .post(protect, createActivity);

router.route('/:id')
  .put(protect, updateActivity)
  .delete(protect, deleteActivity);

module.exports = router;
