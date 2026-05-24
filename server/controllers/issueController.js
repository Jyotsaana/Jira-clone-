const Issue = require('../models/Issue');

const createIssue = async (req, res) => {
  const { title, description, type, priority, projectId, assigneeId, dueDate, storyPoints } = req.body;
  try {
    const issue = await Issue.create({ title, description, type, priority, project: projectId, assignee: assigneeId, reporter: req.user._id, dueDate, storyPoints });
    res.status(201).json(issue);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getIssuesByProject = async (req, res) => {
  try {
    const issues = await Issue.find({ project: req.params.projectId })
      .populate('assignee', 'name email')
      .populate('reporter', 'name email');
    res.json(issues);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(issue);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteIssue = async (req, res) => {
  try {
    await Issue.findByIdAndDelete(req.params.id);
    res.json({ message: 'Issue deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { createIssue, getIssuesByProject, updateIssue, deleteIssue };
