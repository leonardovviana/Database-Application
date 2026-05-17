const express = require('express');
const router = express.Router();
const vendasController = require('../controllers/vendasController');
const { validateCreate, validateUpdate } = require('../middleware/validation');

router.get('/busca', vendasController.search);
router.get('/', vendasController.list);
router.get('/:id', vendasController.getById);
router.post('/', validateCreate('vendas'), vendasController.create);
router.put('/:id', validateUpdate('vendas'), vendasController.update);
router.delete('/:id', vendasController.delete);

module.exports = router;
