const User = require('../models/User');
const Report = require('../models/Report');
const { startOfWeek, endOfWeek } = require('../utils/dateUtils');

async function buildDashboard(weekStartInput) {
  const weekStart = startOfWeek(weekStartInput ? new Date(weekStartInput) : new Date());
  const weekEnd = endOfWeek(weekStart);

  const [members, reports, trendReports] = await Promise.all([
    User.find({ role: 'TEAM_MEMBER', isActive: true }).sort({ name: 1 }),
    Report.find({ weekStart: { $gte: weekStart, $lte: weekEnd } })
      .populate('user', 'name email jobTitle')
      .populate('project', 'name color')
      .sort({ updatedAt: -1 }),
    Report.find({ status: 'SUBMITTED' })
      .populate('project', 'name color')
      .sort({ weekStart: 1 })
      .limit(100),
  ]);

  const reportByUser = new Map(reports.map((report) => [String(report.user._id), report]));

  const memberStatuses = members.map((member) => {
    const report = reportByUser.get(String(member._id));
    let status = 'PENDING';
    if (report?.status === 'SUBMITTED') {
      status = report.submittedAt && report.submittedAt > weekEnd ? 'LATE' : 'SUBMITTED';
    }

    return {
      user: member.toPublicJSON(),
      status,
      reportId: report?._id || null,
      project: report?.project || null,
      updatedAt: report?.updatedAt || null,
    };
  });

  const submittedCount = memberStatuses.filter((item) => ['SUBMITTED', 'LATE'].includes(item.status)).length;
  const pendingCount = memberStatuses.filter((item) => item.status === 'PENDING').length;
  const lateCount = memberStatuses.filter((item) => item.status === 'LATE').length;
  const openBlockers = reports.reduce((sum, report) => sum + (report.blockerCount || 0), 0);
  const complianceRate = members.length ? Math.round((submittedCount / members.length) * 100) : 0;

  const trendMap = new Map();
  trendReports.forEach((report) => {
    const key = new Date(report.weekStart).toISOString().slice(0, 10);
    const current = trendMap.get(key) || { week: key, tasks: 0, reports: 0 };
    current.tasks += report.taskCount || 0;
    current.reports += 1;
    trendMap.set(key, current);
  });

  const projectMap = new Map();
  reports.forEach((report) => {
    const key = report.project?.name || 'Unassigned';
    const current = projectMap.get(key) || {
      name: key,
      tasks: 0,
      hours: 0,
      color: report.project?.color || '#5B5BD6',
    };
    current.tasks += report.taskCount || 0;
    current.hours += report.hoursWorked || 0;
    projectMap.set(key, current);
  });

  return {
    period: { weekStart, weekEnd },
    metrics: {
      teamMembers: members.length,
      submitted: submittedCount,
      pending: pendingCount,
      late: lateCount,
      complianceRate,
      openBlockers,
    },
    memberStatuses,
    taskTrend: Array.from(trendMap.values()).slice(-8),
    workloadByProject: Array.from(projectMap.values()),
    recentReports: reports.slice(0, 6),
  };
}

module.exports = { buildDashboard };
