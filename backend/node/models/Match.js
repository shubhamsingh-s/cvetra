const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MatchSchema = new Schema({
  resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  matchScore: { type: Number, default: 0, index: true },
  skillMatch: { type: Number, default: 0 },
  semanticScore: { type: Number, default: 0 },
  shortlist: { type: Boolean, default: false },
  invited: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', MatchSchema);
