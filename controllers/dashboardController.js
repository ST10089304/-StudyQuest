const taskModel = require('../models/taskModel');
const userModel = require('../models/userModel');
const badgeModel = require('../models/badgeModel');

async function showDashboard(req, res, next) {
  try {
    await badgeModel.evaluateBadges(req.user.userId);
    const [tasks, stats, user, badges] = await Promise.all([
      taskModel.getByUser(req.user.userId),
      taskModel.getStats(req.user.userId),
      userModel.findById(req.user.userId),
      badgeModel.getAllForUser(req.user.userId)
    ]);

    res.render('dashboard', {
      title: 'Dashboard',
      tasks: tasks.slice(0, 5),
      stats,
      user,
      badges: badges.filter(b => b.Earned).slice(0, 3)
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { showDashboard };
