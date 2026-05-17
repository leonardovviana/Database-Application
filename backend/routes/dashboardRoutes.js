const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/', dashboardController.getStats);
router.get('/vendas-mensais', dashboardController.getMonthlySales);
router.get('/vendas-concessionaria', dashboardController.getVendasPorConcessionaria);
router.get('/faturamento-categoria', dashboardController.getFaturamentoPorCategoria);
router.get('/ranking-vendedores', dashboardController.getRankingVendedores);

module.exports = router;
