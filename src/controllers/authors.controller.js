const authorsService = require('../services/authors.service');

function listAuthors(req, res) {
  res.status(200).json(authorsService.findAll());
}

function getAuthorById(req, res) {
  const author = authorsService.findById(req.params.id);
  if (!author) return res.status(404).json({ error: 'Author not found' });
  res.status(200).json(author);
}

function createAuthor(req, res) {
  const { name, email, bio } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const newAuthor = authorsService.create({ name, email, bio });
  res.status(201).json(newAuthor);
}

function updateAuthor(req, res) {
  const updated = authorsService.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Author not found' });
  res.status(200).json(updated);
}

function deleteAuthor(req, res) {
  const deleted = authorsService.remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Author not found' });
  res.status(204).send();
}

module.exports = { listAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor };
