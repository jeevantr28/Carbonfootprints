const db = require('../config/db');

// @desc    Get dashboard summary stats
// @route   GET /api/stats/summary
// @access  Private
const getSummaryStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get total all time
    const [totalRes] = await db.query('SELECT SUM(co2_kg) as total FROM activities WHERE user_id = ?', [userId]);
    const totalAllTime = totalRes[0].total || 0;

    // Get total this week
    const [weekRes] = await db.query(
      'SELECT SUM(co2_kg) as total FROM activities WHERE user_id = ? AND activity_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)',
      [userId]
    );
    const totalThisWeek = weekRes[0].total || 0;

    // Get total this month
    const [monthRes] = await db.query(
      'SELECT SUM(co2_kg) as total FROM activities WHERE user_id = ? AND MONTH(activity_date) = MONTH(CURDATE()) AND YEAR(activity_date) = YEAR(CURDATE())',
      [userId]
    );
    const totalThisMonth = monthRes[0].total || 0;

    // Get user goal
    const [userRes] = await db.query('SELECT monthly_goal FROM users WHERE id = ?', [userId]);
    const monthlyGoal = userRes[0]?.monthly_goal || 100;

    res.json({
      success: true,
      data: {
        totalAllTime: parseFloat(totalAllTime).toFixed(2),
        totalThisWeek: parseFloat(totalThisWeek).toFixed(2),
        totalThisMonth: parseFloat(totalThisMonth).toFixed(2),
        monthlyGoal
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stats by category
// @route   GET /api/stats/by-category
// @access  Private
const getStatsByCategory = async (req, res, next) => {
  try {
    const [results] = await db.query(`
      SELECT c.name as category, SUM(a.co2_kg) as value 
      FROM activities a 
      JOIN categories c ON a.category_id = c.id 
      WHERE a.user_id = ? 
      GROUP BY c.name
    `, [req.user.id]);

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stats trend (last 30 days)
// @route   GET /api/stats/trend
// @access  Private
const getStatsTrend = async (req, res, next) => {
  try {
    const [results] = await db.query(`
      SELECT DATE_FORMAT(activity_date, '%Y-%m-%d') as date, SUM(co2_kg) as co2 
      FROM activities 
      WHERE user_id = ? AND activity_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
      GROUP BY activity_date 
      ORDER BY activity_date ASC
    `, [req.user.id]);

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummaryStats,
  getStatsByCategory,
  getStatsTrend,
};
