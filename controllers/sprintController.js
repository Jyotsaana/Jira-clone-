const Sprint = require('../models/Sprint');

const createSprint = async (req, res) => {
  const { name, projectId, startDate, endDate, goal } = req.body;
  try {
    const sprint = await Sprint.create({ name, project: projectId, startDate, endDate, goal });
    res.status(201).json(sprint);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getSprintsByProject = async (req, res) => {
  try {
    const sprints = await Sprint.find({ project: req.params.projectId });
    res.json(sprints);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(sprint);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { createSprint, getSprintsByProject, updateSprint };
