const { Router } = require('express');
const postsController = require('../controllers/posts.controller');
const validateIdParam = require('../middlewares/validateIdParam');
const validatePostBody = require('../middlewares/validatePostBody');

const router = Router();

router.get('/', postsController.listPosts);
router.get('/author/:authorId', validateIdParam('authorId'), postsController.getPostsByAuthorId);
router.get('/:id', validateIdParam('id'), postsController.getPostById);
router.post('/', validatePostBody, postsController.createPost);
router.put('/:id', validateIdParam('id'), validatePostBody, postsController.updatePost);
router.delete('/:id', validateIdParam('id'), postsController.deletePost);

module.exports = router;
