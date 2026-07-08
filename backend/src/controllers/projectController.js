const Project = require('../models/Project');
const Report = require('../models/Report');
const asyncHandler = require('../utils/asyncHandler');

const getProjects = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'MANAGER' ? {} : { isActive: true };
  const projects = await Project.find(filter).sort({ isActive: -1, name: 1 });
  res.json({ projects });
});

const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    name: req.body.name,
    description: req.body.description || '',
    color: req.body.color || '#5B5BD6',
    isActive: req.body.isActive !== false,
  });
  res.status(201).json({ project });
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project was not found.' });

  project.name = req.body.name;
  project.description = req.body.description || '';
  project.color = req.body.color || project.color;
  project.isActive = req.body.isActive !== false;
  await project.save();

  res.json({ project });
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project was not found.' });

  const reportCount = await Report.countDocuments({ project: project._id });
  if (reportCount > 0) {
    project.isActive = false;
    await project.save();
    return res.json({
      message: 'Project is used by reports, so it was archived instead of permanently deleted.',
      project,
    });
  }

  await project.deleteOne();
  res.json({ message: 'Project deleted.' });
});

module.exports = { getProjects, createProject, updateProject, deleteProject };
