const express = require('express');
const router = express.Router();
const veiculosController = require('../controllers/veiculosController');
const { validateCreate, validateUpdate } = require('../middleware/validation');

router.get('/busca', veiculosController.search);
router.get('/', veiculosController.list);
router.get('/:id', veiculosController.getById);
router.post('/', validateCreate('veiculos'), veiculosController.create);
router.put('/:id', validateUpdate('veiculos'), veiculosController.update);
router.delete('/:id', veiculosController.delete);

module.exports = router;
