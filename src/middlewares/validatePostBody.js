function validatePostBody(req, res, next) {
  const { title, content, author_id, published } = req.body;
  const isCreate = req.method === 'POST';

  if (isCreate && (!title || !content || author_id === undefined)) {
    return res.status(400).json({ error: 'title, content and author_id are required' });
  }
  if (title !== undefined && typeof title !== 'string') {
    return res.status(400).json({ error: 'title must be a string' });
  }
  if (content !== undefined && typeof content !== 'string') {
    return res.status(400).json({ error: 'content must be a string' });
  }
  if (author_id !== undefined && !/^\d+$/.test(String(author_id))) {
    return res.status(400).json({ error: 'author_id must be a positive integer' });
  }
  if (published !== undefined && typeof published !== 'boolean') {
    return res.status(400).json({ error: 'published must be a boolean' });
  }
  next();
}

module.exports = validatePostBody;
