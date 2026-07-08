const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      unique: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    color: {
      type: String,
      default: '#5B5BD6',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex value'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
