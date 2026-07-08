const User = require('../models/User');
const Report = require('../models/Report');
const Task = require('../models/Task');
const { startOfWeek, endOfWeek } = require('../utils/dateUtils');

async function buildTeamOverview(weekStartInput) {
  const weekStart = startOfWeek(weekStartInput ? new Date(weekStartInput) : new Date());
  const weekEnd = endOfWeek(weekStart);

  const [members, currentReports, reportStats, taskStats] = await Promise.all([
    User.find({ role: 'TEAM_MEMBER', isActive: true }).sort({ name: 1 }),
    Report.find({ weekStart: { $gte: weekStart, $lte: weekEnd } })
      .populate('project', 'name color')
      .sort({ updatedAt: -1 }),
    Report.aggregate([
      { $group: { _id: '$user', reportCount: { $sum: 1 }, blockerCount: { $sum: '$blockerCount' } } },
    ]),
    Task.aggregate([
      { $match: { status: { $ne: 'DONE' } } },
      { $group: { _id: '$assignee', activeTaskCount: { $sum: 1 } } },
    ]),
  ]);

  const reportByUser = new Map(currentReports.map((report) => [String(report.user), report]));
  const reportStatsByUser = new Map(reportStats.map((item) => [String(item._id), item]));
  const taskStatsByUser = new Map(taskStats.map((item) => [String(item._id), item]));

  return {
    period: { weekStart, weekEnd },
    members: members.map((member) => {
      const report = reportByUser.get(String(member._id));
      const reports = reportStatsByUser.get(String(member._id));
      const tasks = taskStatsByUser.get(String(member._id));

      let submissionStatus = 'PENDING';
      if (report?.status === 'SUBMITTED') {
        submissionStatus = report.submittedAt && report.submittedAt > weekEnd ? 'LATE' : 'SUBMITTED';
      }

      return {
        ...member.toPublicJSON(),
        submissionStatus,
        currentReport: report || null,
        totalReports: reports?.reportCount || 0,
        totalBlockersReported: reports?.blockerCount || 0,
        activeTaskCount: tasks?.activeTaskCount || 0,
      };
    }),
  };
}

async function getMemberDetails(memberId) {
  const member = await User.findOne({ _id: memberId, role: 'TEAM_MEMBER', isActive: true });
  if (!member) return null;

  const [reports, tasks] = await Promise.all([
    Report.find({ user: member._id })
      .populate('project', 'name color description')
      .sort({ weekStart: -1 })
      .limit(12),
    Task.find({ assignee: member._id })
      .populate('project', 'name color description')
      .populate('assignedBy', 'name jobTitle')
      .sort({ status: 1, dueDate: 1 }),
  ]);

  const submittedReports = reports.filter((report) => report.status === 'SUBMITTED').length;
  const activeTasks = tasks.filter((task) => task.status !== 'DONE').length;
  const completedTasks = tasks.filter((task) => task.status === 'DONE').length;

  return {
    user: member.toPublicJSON(),
    stats: {
      reportCount: reports.length,
      submittedReports,
      activeTasks,
      completedTasks,
      blockersReported: reports.reduce((sum, report) => sum + (report.blockerCount || 0), 0),
    },
    reports,
    tasks,
  };
}

module.exports = { buildTeamOverview, getMemberDetails };
