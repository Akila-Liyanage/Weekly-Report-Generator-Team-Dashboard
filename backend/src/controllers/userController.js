const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { buildTeamOverview, getMemberDetails } = require('../services/teamService');

const getTeamMembers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'TEAM_MEMBER', isActive: true }).sort({ name: 1 });
  res.json({ users: users.map((user) => user.toPublicJSON()) });
});

const getTeamOverview = asyncHandler(async (req, res) => {
  const overview = await buildTeamOverview(req.query.weekStart);
  res.json(overview);
});

const getTeamMember = asyncHandler(async (req, res) => {
  const member = await getMemberDetails(req.params.id);
  if (!member) return res.status(404).json({ message: 'Team member was not found.' });
  res.json(member);
});

module.exports = { getTeamMembers, getTeamOverview, getTeamMember };
