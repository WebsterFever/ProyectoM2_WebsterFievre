const postsService = require('../services/posts.service');
const authorsService = require('../services/authors.service');

async function listPosts(req, res, next) {
  try {
    const posts = await postsService.findAll();
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
}

async function getPostById(req, res, next) {
  try {
    const post = await postsService.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
}

async function getPostsByAuthorId(req, res, next) {
  try {
    const author = await authorsService.findById(req.params.authorId);
    const posts = await postsService.findByAuthorId(req.params.authorId);
    res.status(200).json({ author, posts });
  } catch (err) {
    next(err);
  }
}

async function createPost(req, res, next) {
  try {
    const { title, content, author_id, published } = req.body;
    try {
      await authorsService.findById(author_id);
    } catch (err) {
      if (err.status === 404) {
        return res.status(400).json({ error: 'author_id does not match an existing author' });
      }
      throw err;
    }
    const newPost = await postsService.create({ title, content, author_id, published });
    res.status(201).json(newPost);
  } catch (err) {
    next(err);
  }
}

async function updatePost(req, res, next) {
  try {
    const { author_id } = req.body;
    if (author_id !== undefined) {
      try {
        await authorsService.findById(author_id);
      } catch (err) {
        if (err.status === 404) {
          return res.status(400).json({ error: 'author_id does not match an existing author' });
        }
        throw err;
      }
    }
    const updated = await postsService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Post not found' });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const deleted = await postsService.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Post not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listPosts, getPostById, getPostsByAuthorId, createPost, updatePost, deletePost };
