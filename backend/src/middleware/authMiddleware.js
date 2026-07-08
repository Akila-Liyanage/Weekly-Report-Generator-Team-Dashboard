const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.split(' ')[1]
    : null;

  if (!token) {
    res.status(401);
    throw new Error('Authentication is required.');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error('Your session is invalid or has expired.');
  }

  const user = await User.findById(payload.userId);
  if (!user || !user.isActive) {
    res.status(401);
    throw new Error('User account was not found or is inactive.');
  }

  req.user = user;
  next();
});

function authorize(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error('You do not have permission to perform this action.'));
    }

    return next();
  };
}

module.exports = { protect, authorize };
