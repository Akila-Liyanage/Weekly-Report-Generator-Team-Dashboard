const Report = require('../models/Report');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');
const { createReport, updateOwnReport, submitOwnReport } = require('../services/reportService');

const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ user: req.user._id })
    .populate('project', 'name color description')
    .sort({ weekStart: -1 });
  res.json({ reports });
});

const createMyReport = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.body.project, isActive: true });
  if (!project) return res.status(400).json({ message: 'Select an active project.' });

  const report = await createReport(req.user._id, req.body);
  await report.populate('project', 'name color description');
  res.status(201).json({ report });
});

const updateMyReport = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.body.project, isActive: true });
  if (!project) return res.status(400).json({ message: 'Select an active project.' });

  const report = await updateOwnReport(req.user._id, req.params.id, req.body);
  if (!report) return res.status(404).json({ message: 'Report was not found.' });

  await report.populate('project', 'name color description');
  res.json({ report });
});

const submitMyReport = asyncHandler(async (req, res) => {
  const report = await submitOwnReport(req.user._id, req.params.id);
  if (!report) return res.status(404).json({ message: 'Report was not found.' });

  await report.populate('project', 'name color description');
  res.json({ report });
});

const deleteMyReport = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, user: req.user._id });
  if (!report) return res.status(404).json({ message: 'Report was not found.' });
  if (report.status === 'SUBMITTED') {
    return res.status(400).json({ message: 'Submitted reports cannot be deleted. Edit the report instead.' });
  }

  await report.deleteOne();
  res.json({ message: 'Draft report deleted.' });
});

const getTeamReports = asyncHandler(async (req, res) => {
  const { userId, projectId, status, startDate, endDate, q } = req.query;
  const filter = {};

  if (userId) filter.user = userId;
  if (projectId) filter.project = projectId;
  if (status && ['DRAFT', 'SUBMITTED'].includes(status)) filter.status = status;
  if (startDate || endDate) {
    filter.weekStart = {};
    if (startDate) filter.weekStart.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.weekStart.$lte = end;
    }
  }

  const reports = await Report.find(filter)
    .populate('user', 'name email jobTitle')
    .populate('project', 'name color description')
    .sort({ weekStart: -1, updatedAt: -1 });

  const search = q?.trim().toLowerCase();
  const filteredReports = search
    ? reports.filter((report) => [
        report.user?.name,
        report.user?.email,
        report.user?.jobTitle,
        report.project?.name,
        report.tasksCompleted,
        report.tasksPlanned,
        report.blockers,
        report.notes,
      ].filter(Boolean).join(' ').toLowerCase().includes(search))
    : reports;

  res.json({ reports: filteredReports });
});

module.exports = {
  getMyReports,
  createMyReport,
  updateMyReport,
  submitMyReport,
  deleteMyReport,
  getTeamReports,
};
