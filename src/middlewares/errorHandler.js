function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === '23505') {
    return res.status(400).json({ error: 'duplicate value violates a unique constraint' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'referenced resource does not exist' });
  }
  if (err.code === '22P02') {
    return res.status(400).json({ error: 'invalid input syntax' });
  }

  res.status(500).json({ error: 'internal server error' });
}

module.exports = errorHandler;
