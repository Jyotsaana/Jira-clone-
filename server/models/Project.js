const mongoose = require('mongoose');
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  key: { type: String, required: true, unique: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'archived'], default: 'active' }
}, { timestamps: true });
module.exports = mongoose.model('Project', projectSchema);
