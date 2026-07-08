const Task = require('../models/Task');
const User = require('../models/User');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');

const taskPopulate = [
  { path: 'assignee', select: 'name email jobTitle' },
  { path: 'project', select: 'name color description' },
  { path: 'assignedBy', select: 'name jobTitle' },
];

function buildTaskFilter(req) {
  const filter = req.user.role === 'MANAGER' ? {} : { assignee: req.user._id };
  const { userId, projectId, status } = req.query;

  if (req.user.role === 'MANAGER' && userId) filter.assignee = userId;
  if (projectId) filter.project = projectId;
  if (status && ['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) filter.status = status;

  return filter;
}

function matchesSearch(task, query) {
  const search = query?.trim().toLowerCase();
  if (!search) return true;
  const searchText = [
    task.title,
    task.description,
    task.assignee?.name,
    task.assignee?.jobTitle,
    task.project?.name,
  ].filter(Boolean).join(' ').toLowerCase();

  return searchText.includes(search);
}

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find(buildTaskFilter(req))
    .populate(taskPopulate)
    .sort({ status: 1, dueDate: 1, createdAt: -1 });

  res.json({ tasks: tasks.filter((task) => matchesSearch(task, req.query.q)) });
});

const createTask = asyncHandler(async (req, res) => {
  const [assignee, project] = await Promise.all([
    User.findOne({ _id: req.body.assignee, role: 'TEAM_MEMBER', isActive: true }),
    Project.findOne({ _id: req.body.project, isActive: true }),
  ]);

  if (!assignee) return res.status(400).json({ message: 'Select an active team member.' });
  if (!project) return res.status(400).json({ message: 'Select an active project.' });

  const task = await Task.create({
    title: req.body.title,
    description: req.body.description || '',
    assignee: assignee._id,
    project: project._id,
    assignedBy: req.user._id,
    dueDate: req.body.dueDate,
    priority: req.body.priority || 'MEDIUM',
    status: req.body.status || 'TODO',
  });

  await task.populate(taskPopulate);
  res.status(201).json({ task });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task was not found.' });

  const [assignee, project] = await Promise.all([
    User.findOne({ _id: req.body.assignee, role: 'TEAM_MEMBER', isActive: true }),
    Project.findOne({ _id: req.body.project, isActive: true }),
  ]);

  if (!assignee) return res.status(400).json({ message: 'Select an active team member.' });
  if (!project) return res.status(400).json({ message: 'Select an active project.' });

  task.title = req.body.title;
  task.description = req.body.description || '';
  task.assignee = assignee._id;
  task.project = project._id;
  task.dueDate = req.body.dueDate;
  task.priority = req.body.priority || 'MEDIUM';
  task.status = req.body.status || task.status;
  await task.save();
  await task.populate(taskPopulate);

  res.json({ task });
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task was not found.' });

  const ownsTask = String(task.assignee) === String(req.user._id);
  if (req.user.role !== 'MANAGER' && !ownsTask) {
    return res.status(403).json({ message: 'You can only update tasks assigned to you.' });
  }

  task.status = req.body.status;
  await task.save();
  await task.populate(taskPopulate);
  res.json({ task });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task was not found.' });

  await task.deleteOne();
  res.json({ message: 'Task deleted.' });
});

module.exports = { getTasks, createTask, updateTask, updateTaskStatus, deleteTask };
