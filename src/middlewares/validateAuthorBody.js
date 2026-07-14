function validateAuthorBody(req, res, next) {
  const { name, email, bio } = req.body;
  const isCreate = req.method === 'POST';

  if (isCreate && (!name || !email)) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  if (name !== undefined && typeof name !== 'string') {
    return res.status(400).json({ error: 'name must be a string' });
  }
  if (email !== undefined && typeof email !== 'string') {
    return res.status(400).json({ error: 'email must be a string' });
  }
  if (bio !== undefined && bio !== null && typeof bio !== 'string') {
    return res.status(400).json({ error: 'bio must be a string' });
  }
  next();
}

module.exports = validateAuthorBody;
