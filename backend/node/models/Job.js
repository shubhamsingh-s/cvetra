const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobSchema = new Schema({
  recruiterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  requiredSkills: { type: [String], default: [] },
  experienceRequired: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);
