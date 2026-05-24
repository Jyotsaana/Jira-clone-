const mongoose = require('mongoose');
const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['bug', 'task', 'story', 'epic'], default: 'task' },
  status: { type: String, enum: ['todo', 'inprogress', 'inreview', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sprint: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' },
  dueDate: { type: Date },
  storyPoints: { type: Number, default: 0 }
}, { timestamps: true });
module.exports = mongoose.model('Issue', issueSchema);
