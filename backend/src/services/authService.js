const jwt = require('jsonwebtoken');
const User = require('../models/User');

function createToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function registerUser(payload) {
  const existingUser = await User.findOne({ email: payload.email.toLowerCase() });
  if (existingUser) {
    const error = new Error('An account already exists with this email address.');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role || 'TEAM_MEMBER',
    jobTitle: payload.jobTitle || (payload.role === 'MANAGER' ? 'Engineering Manager' : 'Team Member'),
  });

  return { user, token: createToken(user._id) };
}

async function loginUser(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Email or password is incorrect.');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('This account is inactive.');
    error.statusCode = 403;
    throw error;
  }

  return { user, token: createToken(user._id) };
}

module.exports = { registerUser, loginUser };
