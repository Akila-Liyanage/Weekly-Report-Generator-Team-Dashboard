const express = require('express');
const {
  getMyReports,
  createMyReport,
  updateMyReport,
  submitMyReport,
  deleteMyReport,
  getTeamReports,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateReport } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);
router.get('/my', authorize('TEAM_MEMBER'), getMyReports);
router.post('/', authorize('TEAM_MEMBER'), validateReport, createMyReport);
router.get('/team', authorize('MANAGER'), getTeamReports);
router.put('/:id', authorize('TEAM_MEMBER'), validateReport, updateMyReport);
router.patch('/:id/submit', authorize('TEAM_MEMBER'), submitMyReport);
router.delete('/:id', authorize('TEAM_MEMBER'), deleteMyReport);

module.exports = router;
