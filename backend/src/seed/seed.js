require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Report = require('../models/Report');
const Task = require('../models/Task');
const { startOfWeek, endOfWeek } = require('../utils/dateUtils');

function shiftDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function seedDatabase() {
  await connectDatabase();

  await Promise.all([
    Task.deleteMany({}),
    Report.deleteMany({}),
    Project.deleteMany({}),
    User.deleteMany({}),
  ]);

  const users = await User.create([
    {
      name: 'Maya Fernando',
      email: 'manager@weeklyhub.dev',
      password: 'Manager123!',
      role: 'MANAGER',
      jobTitle: 'Engineering Manager',
    },
    {
      name: 'Akila Liyanage',
      email: 'akila@weeklyhub.dev',
      password: 'Member123!',
      role: 'TEAM_MEMBER',
      jobTitle: 'Software Engineer Intern',
    },
    {
      name: 'Nimal Perera',
      email: 'nimal@weeklyhub.dev',
      password: 'Member123!',
      role: 'TEAM_MEMBER',
      jobTitle: 'Frontend Developer',
    },
    {
      name: 'Sara Silva',
      email: 'sara@weeklyhub.dev',
      password: 'Member123!',
      role: 'TEAM_MEMBER',
      jobTitle: 'UI/UX Designer',
    },
    {
      name: 'Dilshan Jayasuriya',
      email: 'dilshan@weeklyhub.dev',
      password: 'Member123!',
      role: 'TEAM_MEMBER',
      jobTitle: 'QA Engineer',
    },
  ]);

  const memberByEmail = Object.fromEntries(users.map((user) => [user.email, user]));

  const projects = await Project.create([
    {
      name: 'Client Portal',
      description: 'Customer-facing portal and account management features.',
      color: '#5B5BD6',
    },
    {
      name: 'Internal Tooling',
      description: 'Internal automation and productivity improvements.',
      color: '#0F9F80',
    },
    {
      name: 'Research & Development',
      description: 'Technical experiments and product discovery.',
      color: '#D97706',
    },
    {
      name: 'Marketing Website',
      description: 'Public website design, content and performance.',
      color: '#DC4C64',
    },
  ]);

  const projectByName = Object.fromEntries(projects.map((project) => [project.name, project]));
  const currentWeekStart = startOfWeek(new Date());
  const currentWeekEnd = endOfWeek(currentWeekStart);

  const reportTemplates = [
    {
      user: memberByEmail['akila@weeklyhub.dev']._id,
      project: projectByName['Client Portal']._id,
      weekStart: currentWeekStart,
      weekEnd: currentWeekEnd,
      tasksCompleted: '- Built the login and registration pages\n- Connected the authentication API\n- Added protected routes',
      tasksPlanned: '- Complete the weekly report form\n- Add form validation\n- Test manager access',
      blockers: '- Waiting for final dashboard field confirmation',
      hoursWorked: 34,
      notes: 'Pull request is ready for review.',
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
    {
      user: memberByEmail['nimal@weeklyhub.dev']._id,
      project: projectByName['Internal Tooling']._id,
      weekStart: currentWeekStart,
      weekEnd: currentWeekEnd,
      tasksCompleted: '- Created reusable table component\n- Added pagination styles',
      tasksPlanned: '- Connect reports table to API\n- Add empty states',
      blockers: '',
      hoursWorked: 28,
      notes: 'Draft report.',
      status: 'DRAFT',
    },
    {
      user: memberByEmail['sara@weeklyhub.dev']._id,
      project: projectByName['Marketing Website']._id,
      weekStart: currentWeekStart,
      weekEnd: currentWeekEnd,
      tasksCompleted: '- Finalized homepage wireframes\n- Prepared mobile design variants\n- Updated design tokens',
      tasksPlanned: '- Run design review\n- Prepare developer handoff',
      blockers: '- Need approved copy for the pricing section',
      hoursWorked: 31,
      notes: 'Figma link added in the team workspace.',
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
  ];

  const historicalMembers = [
    memberByEmail['akila@weeklyhub.dev'],
    memberByEmail['nimal@weeklyhub.dev'],
    memberByEmail['sara@weeklyhub.dev'],
    memberByEmail['dilshan@weeklyhub.dev'],
  ];

  for (let weeksAgo = 1; weeksAgo <= 5; weeksAgo += 1) {
    const weekStart = shiftDays(currentWeekStart, -7 * weeksAgo);
    const weekEnd = endOfWeek(weekStart);

    historicalMembers.forEach((member, index) => {
      reportTemplates.push({
        user: member._id,
        project: projects[(weeksAgo + index) % projects.length]._id,
        weekStart,
        weekEnd,
        tasksCompleted: `- Completed feature ${weeksAgo}.${index + 1}\n- Reviewed team changes\n- Updated documentation`,
        tasksPlanned: '- Continue implementation\n- Add tests',
        blockers: (weeksAgo + index) % 3 === 0 ? '- Dependency from another team' : '',
        hoursWorked: 30 + ((weeksAgo + index) % 9),
        notes: 'Seeded historical report for dashboard charts.',
        status: 'SUBMITTED',
        submittedAt: weeksAgo === 1 && index === 3 ? shiftDays(weekEnd, 2) : shiftDays(weekEnd, -1),
      });
    });
  }

  await Report.create(reportTemplates);

  const manager = memberByEmail['manager@weeklyhub.dev'];
  await Task.create([
    {
      title: 'Complete manager report details view',
      description: 'Add a clear modal that shows completed work, next-week plans, blockers, hours, and notes.',
      assignee: memberByEmail['akila@weeklyhub.dev']._id,
      project: projectByName['Client Portal']._id,
      assignedBy: manager._id,
      dueDate: shiftDays(new Date(), 5),
      priority: 'HIGH',
      status: 'IN_PROGRESS',
    },
    {
      title: 'Connect reports table search',
      description: 'Allow managers to search report content by member, project, completed work, or blocker text.',
      assignee: memberByEmail['nimal@weeklyhub.dev']._id,
      project: projectByName['Internal Tooling']._id,
      assignedBy: manager._id,
      dueDate: shiftDays(new Date(), 7),
      priority: 'MEDIUM',
      status: 'TODO',
    },
    {
      title: 'Prepare mobile dashboard review',
      description: 'Check dashboard cards, tables, and report details on smaller screens.',
      assignee: memberByEmail['sara@weeklyhub.dev']._id,
      project: projectByName['Marketing Website']._id,
      assignedBy: manager._id,
      dueDate: shiftDays(new Date(), 3),
      priority: 'MEDIUM',
      status: 'DONE',
    },
    {
      title: 'Test weekly report workflow',
      description: 'Verify draft creation, editing, submission, search, and role protection.',
      assignee: memberByEmail['dilshan@weeklyhub.dev']._id,
      project: projectByName['Client Portal']._id,
      assignedBy: manager._id,
      dueDate: shiftDays(new Date(), 9),
      priority: 'HIGH',
      status: 'TODO',
    },
  ]);

  console.log('\nSeed completed successfully.');
  console.log('Manager login: manager@weeklyhub.dev / Manager123!');
  console.log('Member login:  akila@weeklyhub.dev / Member123!\n');
}

seedDatabase()
  .catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
