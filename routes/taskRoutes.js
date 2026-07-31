const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/taskController');

const router = express.Router();
const taskValidation = [
  body('title').trim().isLength({ min: 2, max: 150 }).withMessage('Task title must be between 2 and 150 characters.'),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
  body('priority').isIn(['Low', 'Medium', 'High']).withMessage('Select a valid priority.'),
  body('dueDate').isISO8601().withMessage('Select a valid due date.')
];

router.get('/', controller.listTasks);
router.get('/new', controller.renderCreate);
router.post('/', taskValidation, controller.createTask);
router.get('/:id/edit', controller.renderEdit);
router.put('/:id', taskValidation, controller.updateTask);
router.patch('/:id/complete', controller.completeTask);
router.delete('/:id', controller.deleteTask);

module.exports = router;
