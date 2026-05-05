const db = require('../config/db');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const [users] = await db.query('SELECT id, name, email, monthly_goal, created_at FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json({ success: true, data: users[0] });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user goal
// @route   PUT /api/user/goal
// @access  Private
const updateUserGoal = async (req, res, next) => {
  try {
    const { monthly_goal } = req.body;

    if (!monthly_goal) {
      res.status(400);
      throw new Error('Please provide a monthly goal');
    }

    await db.query('UPDATE users SET monthly_goal = ? WHERE id = ?', [monthly_goal, req.user.id]);

    res.json({ success: true, message: 'Goal updated', data: { monthly_goal } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserGoal,
};
