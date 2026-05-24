const Project = require('../models/Project');

const createProject = async (req, res) => {
  const { name, description, key } = req.body;
  try {
    const project = await Project.create({ name, description, key, owner: req.user._id, members: [req.user._id] });
    res.status(201).json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id }).populate('owner', 'name email');
    res.json(projects);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email role');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteProject = async (req, res) => {
  try {

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { createProject, getProjects, getProjectById, deleteProject };
