const express = require('express');
const { getTeamMembers, getTeamOverview, getTeamMember } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('MANAGER'));
router.get('/team', getTeamMembers);
router.get('/team/overview', getTeamOverview);
router.get('/team/:id', getTeamMember);

module.exports = router;
