const express = require('express');
const router = express.Router();
const vendedoresController = require('../controllers/vendedoresController');
const { validateCreate, validateUpdate } = require('../middleware/validation');

router.get('/busca', vendedoresController.search);
router.get('/', vendedoresController.list);
router.get('/:id', vendedoresController.getById);
router.post('/', validateCreate('vendedores'), vendedoresController.create);
router.put('/:id', validateUpdate('vendedores'), vendedoresController.update);
router.delete('/:id', vendedoresController.delete);

module.exports = router;
