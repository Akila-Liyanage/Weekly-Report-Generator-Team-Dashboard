const Report = require('../models/Report');
const { normalizeDate } = require('../utils/dateUtils');

function reportPayload(body) {
  return {
    project: body.project,
    weekStart: normalizeDate(body.weekStart),
    weekEnd: new Date(body.weekEnd),
    tasksCompleted: body.tasksCompleted,
    tasksPlanned: body.tasksPlanned,
    blockers: body.blockers || '',
    hoursWorked: body.hoursWorked === '' || body.hoursWorked === null || body.hoursWorked === undefined
      ? null
      : Number(body.hoursWorked),
    notes: body.notes || '',
  };
}

async function createReport(userId, body) {
  return Report.create({
    user: userId,
    ...reportPayload(body),
  });
}

async function updateOwnReport(userId, reportId, body) {
  const report = await Report.findOne({ _id: reportId, user: userId });
  if (!report) return null;

  Object.assign(report, reportPayload(body));
  return report.save();
}

async function submitOwnReport(userId, reportId) {
  const report = await Report.findOne({ _id: reportId, user: userId });
  if (!report) return null;

  report.status = 'SUBMITTED';
  report.submittedAt = new Date();
  return report.save();
}

module.exports = { createReport, updateOwnReport, submitOwnReport };
