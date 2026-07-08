function validateRegistration(req, res, next) {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) errors.push('Name must contain at least 2 characters.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('A valid email is required.');
  if (!password || password.length < 6) errors.push('Password must contain at least 6 characters.');
  if (role && !['TEAM_MEMBER', 'MANAGER'].includes(role)) errors.push('Role is invalid.');

  if (errors.length) {
    return res.status(400).json({ message: errors.join(' ') });
  }

  return next();
}

function validateReport(req, res, next) {
  const {
    weekStart,
    weekEnd,
    project,
    tasksCompleted,
    tasksPlanned,
    hoursWorked,
  } = req.body;
  const errors = [];

  if (!weekStart || Number.isNaN(new Date(weekStart).getTime())) errors.push('A valid week start date is required.');
  if (!weekEnd || Number.isNaN(new Date(weekEnd).getTime())) errors.push('A valid week end date is required.');
  if (weekStart && weekEnd && new Date(weekEnd) < new Date(weekStart)) errors.push('Week end cannot be before week start.');
  if (!project) errors.push('Project is required.');
  if (!tasksCompleted || !tasksCompleted.trim()) errors.push('Tasks completed is required.');
  if (!tasksPlanned || !tasksPlanned.trim()) errors.push('Tasks planned is required.');
  if (hoursWorked !== '' && hoursWorked !== null && hoursWorked !== undefined) {
    const numericHours = Number(hoursWorked);
    if (Number.isNaN(numericHours) || numericHours < 0 || numericHours > 168) {
      errors.push('Hours worked must be between 0 and 168.');
    }
  }

  if (errors.length) {
    return res.status(400).json({ message: errors.join(' ') });
  }

  return next();
}

function validateProject(req, res, next) {
  const { name, color } = req.body;
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Project name must contain at least 2 characters.' });
  }

  if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return res.status(400).json({ message: 'Project color must use a six-digit hex value.' });
  }

  return next();
}


function validateTask(req, res, next) {
  const { title, assignee, project, dueDate, priority, status } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) errors.push('Task title must contain at least 3 characters.');
  if (!assignee) errors.push('Assignee is required.');
  if (!project) errors.push('Project is required.');
  if (!dueDate || Number.isNaN(new Date(dueDate).getTime())) errors.push('A valid due date is required.');
  if (priority && !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) errors.push('Task priority is invalid.');
  if (status && !['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) errors.push('Task status is invalid.');

  if (errors.length) {
    return res.status(400).json({ message: errors.join(' ') });
  }

  return next();
}

function validateTaskStatus(req, res, next) {
  if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(req.body.status)) {
    return res.status(400).json({ message: 'Task status must be TODO, IN_PROGRESS, or DONE.' });
  }
  return next();
}

module.exports = {
  validateRegistration,
  validateReport,
  validateProject,
  validateTask,
  validateTaskStatus,
};
