const { Router } = require('express');
const authorsController = require('../controllers/authors.controller');
const validateIdParam = require('../middlewares/validateIdParam');
const validateAuthorBody = require('../middlewares/validateAuthorBody');

const router = Router();

router.get('/', authorsController.listAuthors);
router.get('/:id', validateIdParam('id'), authorsController.getAuthorById);
router.post('/', validateAuthorBody, authorsController.createAuthor);
router.put('/:id', validateIdParam('id'), validateAuthorBody, authorsController.updateAuthor);
router.delete('/:id', validateIdParam('id'), authorsController.deleteAuthor);

module.exports = router;
