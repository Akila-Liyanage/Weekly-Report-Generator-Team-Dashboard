const express = require('express');
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateProject } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getProjects);
router.post('/', authorize('MANAGER'), validateProject, createProject);
router.put('/:id', authorize('MANAGER'), validateProject, updateProject);
router.delete('/:id', authorize('MANAGER'), deleteProject);

module.exports = router;
