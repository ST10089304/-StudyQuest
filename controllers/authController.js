const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const userModel = require('../models/userModel');

function renderRegister(req, res) {
  res.render('auth/register', { title: 'Create account', errors: [], values: {} });
}

async function register(req, res, next) {
  const errors = validationResult(req);
  const values = { fullName: req.body.fullName, email: req.body.email };

  if (!errors.isEmpty()) {
    return res.status(400).render('auth/register', {
      title: 'Create account', errors: errors.array(), values
    });
  }

  try {
    const email = req.body.email.trim().toLowerCase();
    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).render('auth/register', {
        title: 'Create account', errors: [{ msg: 'An account with this email already exists.' }], values
      });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    await userModel.createUser({ fullName: req.body.fullName.trim(), email, passwordHash });
    res.redirect('/login?message=Account created successfully. You can now log in.');
  } catch (error) {
    next(error);
  }
}

function renderLogin(req, res) {
  res.render('auth/login', {
    title: 'Log in',
    errors: [],
    values: {},
    message: req.query.message || null
  });
}

async function login(req, res, next) {
  const errors = validationResult(req);
  const values = { email: req.body.email };

  if (!errors.isEmpty()) {
    return res.status(400).render('auth/login', {
      title: 'Log in', errors: errors.array(), values, message: null
    });
  }

  try {
    const user = await userModel.findByEmail(req.body.email.trim().toLowerCase());
    const validPassword = user && await bcrypt.compare(req.body.password, user.PasswordHash);

    if (!validPassword) {
      return res.status(401).render('auth/login', {
        title: 'Log in', errors: [{ msg: 'Email or password is incorrect.' }], values, message: null
      });
    }

    const token = jwt.sign(
      { userId: user.UserId, fullName: user.FullName, email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.cookie('studyquest_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60 * 1000
    });
    res.redirect('/dashboard');
  } catch (error) {
    next(error);
  }
}

function logout(req, res) {
  res.clearCookie('studyquest_token');
  res.redirect('/login?message=You have been logged out.');
}

module.exports = { renderRegister, register, renderLogin, login, logout };
