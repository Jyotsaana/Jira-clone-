const express = require('express');
const router = express.Router();
const { createIssue, getIssuesByProject, updateIssue, deleteIssue } = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');
router.post('/', protect, createIssue);
router.get('/project/:projectId', protect, getIssuesByProject);
router.route('/:id').put(protect, updateIssue).delete(protect, deleteIssue);
module.exports = router;
