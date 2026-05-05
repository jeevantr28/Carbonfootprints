const db = require('../config/db');

// @desc    Get activities
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res, next) => {
  try {
    const { category, startDate, endDate } = req.query;
    
    let query = `
      SELECT a.id, a.description, a.amount, a.co2_kg, a.activity_date, c.name as category, c.icon 
      FROM activities a 
      JOIN categories c ON a.category_id = c.id 
      WHERE a.user_id = ?
    `;
    const queryParams = [req.user.id];

    if (category && category !== 'All') {
      query += ' AND c.name = ?';
      queryParams.push(category.toLowerCase());
    }

    if (startDate && endDate) {
      query += ' AND a.activity_date BETWEEN ? AND ?';
      queryParams.push(startDate, endDate);
    }

    query += ' ORDER BY a.activity_date DESC';

    const [activities] = await db.query(query, queryParams);

    res.json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new activity
// @route   POST /api/activities
// @access  Private
const createActivity = async (req, res, next) => {
  try {
    const { category, description, amount, activity_date } = req.body;

    if (!category || !amount || !activity_date) {
      res.status(400);
      throw new Error('Please provide category, amount, and activity_date');
    }

    // Get category ID and emission factor based on category name
    // For simplicity, we'll pick the first emission factor for the category
    // In a real app, the user might select specific sub-types like "car" or "flight"
    const [categories] = await db.query('SELECT id FROM categories WHERE name = ?', [category.toLowerCase()]);
    if (categories.length === 0) {
      res.status(400);
      throw new Error('Invalid category');
    }
    const category_id = categories[0].id;

    const [factors] = await db.query('SELECT co2_per_unit FROM emission_factors WHERE category_id = ? LIMIT 1', [category_id]);
    
    let co2_kg = 0;
    if (factors.length > 0) {
      co2_kg = parseFloat(amount) * factors[0].co2_per_unit;
    }

    const [result] = await db.query(
      'INSERT INTO activities (user_id, category_id, description, amount, co2_kg, activity_date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, category_id, description || `${category} activity`, amount, co2_kg, activity_date]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        category,
        description,
        amount,
        co2_kg,
        activity_date
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private
const updateActivity = async (req, res, next) => {
  try {
    const activityId = req.params.id;
    const { description, amount } = req.body;

    // Check if activity belongs to user
    const [activities] = await db.query('SELECT * FROM activities WHERE id = ? AND user_id = ?', [activityId, req.user.id]);
    if (activities.length === 0) {
      res.status(404);
      throw new Error('Activity not found or unauthorized');
    }

    const activity = activities[0];
    let co2_kg = activity.co2_kg;

    if (amount) {
      // Recalculate CO2 if amount changed
      const [factors] = await db.query('SELECT co2_per_unit FROM emission_factors WHERE category_id = ? LIMIT 1', [activity.category_id]);
      if (factors.length > 0) {
        co2_kg = parseFloat(amount) * factors[0].co2_per_unit;
      }
    }

    await db.query(
      'UPDATE activities SET description = COALESCE(?, description), amount = COALESCE(?, amount), co2_kg = ? WHERE id = ?',
      [description, amount, co2_kg, activityId]
    );

    res.json({ success: true, message: 'Activity updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
const deleteActivity = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM activities WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    
    if (result.affectedRows === 0) {
      res.status(404);
      throw new Error('Activity not found or unauthorized');
    }

    res.json({ success: true, message: 'Activity removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
};
