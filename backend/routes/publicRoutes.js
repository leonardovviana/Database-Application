const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/veiculos', publicController.listVeiculos);
router.get('/veiculos/destaque', publicController.listDestaque);
router.get('/veiculos/:id', publicController.getVeiculo);
router.post('/contato', publicController.sendContato);

module.exports = router;
