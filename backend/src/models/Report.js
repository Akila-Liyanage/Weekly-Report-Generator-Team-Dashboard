const mongoose = require('mongoose');
const { countTextItems } = require('../utils/dateUtils');

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    weekStart: {
      type: Date,
      required: [true, 'Week start date is required'],
      index: true,
    },
    weekEnd: {
      type: Date,
      required: [true, 'Week end date is required'],
    },
    tasksCompleted: {
      type: String,
      required: [true, 'Tasks completed is required'],
      trim: true,
      maxlength: 5000,
    },
    tasksPlanned: {
      type: String,
      required: [true, 'Tasks planned is required'],
      trim: true,
      maxlength: 5000,
    },
    blockers: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: '',
    },
    hoursWorked: {
      type: Number,
      min: 0,
      max: 168,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: '',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED'],
      default: 'DRAFT',
      index: true,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    taskCount: {
      type: Number,
      default: 0,
    },
    blockerCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

reportSchema.index({ user: 1, weekStart: 1 }, { unique: true });

reportSchema.pre('validate', function calculateCounts(next) {
  this.taskCount = countTextItems(this.tasksCompleted);
  this.blockerCount = countTextItems(this.blockers);
  next();
});

module.exports = mongoose.model('Report', reportSchema);
