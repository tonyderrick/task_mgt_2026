function notFound(req, res) {
  res.status(404).json({ message: `No route matches ${req.method} ${req.originalUrl}.` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'ER_NO_SUCH_TABLE') {
    return res.status(500).json({
      message: 'The tasks table is missing. Run "npm run db:init" in the backend folder.',
    });
  }
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({
      message: 'Cannot reach MySQL. Check the database credentials in backend/.env.',
    });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must be valid JSON.' });
  }

  res.status(500).json({ message: 'Something went wrong on the server.' });
}

module.exports = { notFound, errorHandler };
