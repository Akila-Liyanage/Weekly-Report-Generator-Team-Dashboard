const asyncHandler = require('../utils/asyncHandler');
const { registerUser, loginUser } = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  try {
    const { user, token } = await registerUser(req.body);
    res.status(201).json({ token, user: user.toPublicJSON() });
  } catch (error) {
    res.status(error.statusCode || 500);
    throw error;
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const { user, token } = await loginUser(email, password);
    return res.json({ token, user: user.toPublicJSON() });
  } catch (error) {
    res.status(error.statusCode || 500);
    throw error;
  }
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

module.exports = { register, login, me };
