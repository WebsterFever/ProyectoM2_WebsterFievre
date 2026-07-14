const { Router } = require('express');
const postsController = require('../controllers/posts.controller');

const router = Router();

router.get('/', postsController.listPosts);
router.get('/author/:authorId', postsController.getPostsByAuthorId);
router.get('/:id', postsController.getPostById);
router.post('/', postsController.createPost);
router.put('/:id', postsController.updatePost);
router.delete('/:id', postsController.deletePost);

module.exports = router;
