const { validationResult } = require('express-validator');
const taskModel = require('../models/taskModel');
const badgeModel = require('../models/badgeModel');

async function listTasks(req, res, next) {
  try {
    const tasks = await taskModel.getByUser(req.user.userId);
    res.render('tasks/index', { title: 'My tasks', tasks });
  } catch (error) { next(error); }
}

function renderCreate(req, res) {
  res.render('tasks/form', { title: 'Create task', errors: [], task: {}, action: '/tasks', submitLabel: 'Create task' });
}

async function createTask(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('tasks/form', {
      title: 'Create task', errors: errors.array(), task: req.body, action: '/tasks', submitLabel: 'Create task'
    });
  }

  try {
    await taskModel.createTask(req.user.userId, req.body);
    res.redirect('/tasks');
  } catch (error) { next(error); }
}

async function renderEdit(req, res, next) {
  try {
    const task = await taskModel.getById(Number(req.params.id), req.user.userId);
    if (!task) return res.status(404).render('404', { title: 'Task not found' });
    res.render('tasks/form', {
      title: 'Edit task', errors: [], task, action: `/tasks/${task.TaskId}?_method=PUT`, submitLabel: 'Save changes'
    });
  } catch (error) { next(error); }
}

async function updateTask(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('tasks/form', {
      title: 'Edit task', errors: errors.array(), task: { ...req.body, TaskId: req.params.id },
      action: `/tasks/${req.params.id}?_method=PUT`, submitLabel: 'Save changes'
    });
  }

  try {
    await taskModel.updateTask(Number(req.params.id), req.user.userId, req.body);
    res.redirect('/tasks');
  } catch (error) { next(error); }
}

async function completeTask(req, res, next) {
  try {
    await taskModel.completeTask(Number(req.params.id), req.user.userId);
    await badgeModel.evaluateBadges(req.user.userId);
    res.redirect('/tasks');
  } catch (error) { next(error); }
}

async function deleteTask(req, res, next) {
  try {
    await taskModel.deleteTask(Number(req.params.id), req.user.userId);
    res.redirect('/tasks');
  } catch (error) { next(error); }
}

module.exports = { listTasks, renderCreate, createTask, renderEdit, updateTask, completeTask, deleteTask };
