const {Router} = require('express');
const authorsRoutes = require('./authors.routes');
const postsRoutes = require('./posts.routes');

const router = Router();

router.use('/authors', authorsRoutes);
router.use('/posts', postsRoutes);

module.exports = router;