const postsService = require('../services/posts.service');
const authorsService = require('../services/authors.service');

function listPosts(req, res) {
  res.status(200).json(postsService.findAll());
}

function getPostById(req, res) {
  const post = postsService.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.status(200).json(post);
}

function getPostsByAuthorId(req, res) {
  const author = authorsService.findById(req.params.authorId);
  if (!author) return res.status(404).json({ error: 'Author not found' });
  res.status(200).json({ author, posts: postsService.findByAuthorId(req.params.authorId) });
}

function createPost(req, res) {
  const { title, content, author_id, published } = req.body;
  if (!title || !content || !author_id) {
    return res.status(400).json({ error: 'title, content and author_id are required' });
  }
  if (!authorsService.findById(author_id)) {
    return res.status(400).json({ error: 'author_id does not match an existing author' });
  }
  const newPost = postsService.create({ title, content, author_id, published });
  res.status(201).json(newPost);
}

function updatePost(req, res) {
  const { author_id } = req.body;
  if (author_id !== undefined && !authorsService.findById(author_id)) {
    return res.status(400).json({ error: 'author_id does not match an existing author' });
  }
  const updated = postsService.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Post not found' });
  res.status(200).json(updated);
}

function deletePost(req, res) {
  const deleted = postsService.remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Post not found' });
  res.status(204).send();
}

module.exports = { listPosts, getPostById, getPostsByAuthorId, createPost, updatePost, deletePost };
