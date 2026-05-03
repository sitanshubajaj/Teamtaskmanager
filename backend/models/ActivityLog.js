const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  actionType: {
    type: String,
    enum: [
      'TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 
      'TASK_ASSIGNED', 'PROJECT_CREATED', 'PROJECT_UPDATED',
      'MEMBER_ADDED', 'MEMBER_REMOVED'
    ],
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  targetProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for fetching project activity feed quickly
activityLogSchema.index({ targetProject: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;
