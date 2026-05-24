const express = require('express');
const router = express.Router();
const { createSprint, getSprintsByProject, updateSprint } = require('../controllers/sprintController');
const { protect } = require('../middleware/authMiddleware');
router.post('/', protect, createSprint);
router.get('/project/:projectId', protect, getSprintsByProject);
router.put('/:id', protect, updateSprint);
module.exports = router;
