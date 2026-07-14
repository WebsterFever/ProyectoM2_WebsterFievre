const authorsService = require('../services/authors.service');

async function listAuthors(req, res, next) {
  try {
    const authors = await authorsService.findAll();
    res.status(200).json(authors);
  } catch (err) {
    next(err);
  }
}

async function getAuthorById(req, res, next) {
  try {
    const author = await authorsService.findById(req.params.id);
    res.status(200).json(author);
  } catch (err) {
    next(err);
  }
}

async function createAuthor(req, res, next) {
  try {
    const { name, email, bio } = req.body;
    const newAuthor = await authorsService.create({ name, email, bio });
    res.status(201).json(newAuthor);
  } catch (err) {
    next(err);
  }
}

async function updateAuthor(req, res, next) {
  try {
    const updated = await authorsService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Author not found' });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteAuthor(req, res, next) {
  try {
    const deleted = await authorsService.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Author not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor };
