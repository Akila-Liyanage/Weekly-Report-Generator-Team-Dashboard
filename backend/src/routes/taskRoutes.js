const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateTask, validateTaskStatus } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getTasks);
router.post('/', authorize('MANAGER'), validateTask, createTask);
router.put('/:id', authorize('MANAGER'), validateTask, updateTask);
router.patch('/:id/status', validateTaskStatus, updateTaskStatus);
router.delete('/:id', authorize('MANAGER'), deleteTask);

module.exports = router;
