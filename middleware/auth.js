const jwt = require('jsonwebtoken');

function attachUser(req, res, next) {
  const token = req.cookies.studyquest_token;
  res.locals.currentUser = null;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    res.locals.currentUser = payload;
  } catch {
    res.clearCookie('studyquest_token');
  }

  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.redirect('/login?message=Please log in to continue.');
  }
  next();
}

module.exports = { attachUser, requireAuth };
