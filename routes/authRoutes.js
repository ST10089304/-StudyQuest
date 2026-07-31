const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/authController');

const router = express.Router();

router.get('/register', controller.renderRegister);
router.post('/register', [
  body('fullName').trim().isLength({ min: 2, max: 120 }).withMessage('Full name must be between 2 and 120 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('Enter a valid email address.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must contain at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain a number.'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match.');
    return true;
  })
], controller.register);

router.get('/login', controller.renderLogin);
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Enter a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.')
], controller.login);
router.post('/logout', controller.logout);

module.exports = router;
