function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

function errorHandler(error, req, res, next) {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = error.message || 'Unexpected server error.';

  if (error.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(error.keyPattern || {})[0];
    message = duplicateField === 'email'
      ? 'An account already exists with this email address.'
      : duplicateField === 'name'
        ? 'A project with this name already exists.'
        : 'A report already exists for this user and week.';
  }

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(' ');
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'The provided identifier is invalid.';
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}

module.exports = { notFound, errorHandler };
