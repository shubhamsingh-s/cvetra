const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResumeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  originalFileUrl: { type: String },
  parsedText: { type: String },
  extractedSkills: { type: [String], default: [] },
  experienceYears: { type: Number, default: 0 },
  education: { type: Schema.Types.Mixed },
  atsScore: { type: Number, default: 0, index: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', ResumeSchema);
