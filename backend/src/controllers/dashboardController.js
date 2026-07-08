const asyncHandler = require('../utils/asyncHandler');
const { buildDashboard } = require('../services/dashboardService');

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await buildDashboard(req.query.weekStart);
  res.json(dashboard);
});

module.exports = { getDashboard };
