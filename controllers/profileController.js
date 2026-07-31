const userModel = require('../models/userModel');
const badgeModel = require('../models/badgeModel');
const taskModel = require('../models/taskModel');

async function showProfile(req, res, next) {
  try {
    await badgeModel.evaluateBadges(req.user.userId);
    const [user, badges, stats] = await Promise.all([
      userModel.findById(req.user.userId),
      badgeModel.getAllForUser(req.user.userId),
      taskModel.getStats(req.user.userId)
    ]);
    res.render('profile/index', { title: 'Profile and achievements', user, badges, stats });
  } catch (error) { next(error); }
}

module.exports = { showProfile };
