const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { validateCreate, validateUpdate } = require('../middleware/validation');

router.get('/busca', clientesController.search);
router.get('/', clientesController.list);
router.get('/:id', clientesController.getById);
router.post('/', validateCreate('clientes'), clientesController.create);
router.put('/:id', validateUpdate('clientes'), clientesController.update);
router.delete('/:id', clientesController.delete);

module.exports = router;
