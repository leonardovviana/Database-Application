const express = require('express');
const router = express.Router();
const relatoriosController = require('../controllers/relatoriosController');

router.get('/vendas-mensais', relatoriosController.vendasMensais);
router.get('/vendas-anuais', relatoriosController.vendasAnuais);
router.get('/receita-anual', relatoriosController.receitaAnual);
router.get('/melhor-vendedor', relatoriosController.melhorVendedor);
router.get('/melhor-concessionaria', relatoriosController.melhorConcessionaria);
router.get('/veiculos-mais-vendidos', relatoriosController.veiculosMaisVendidos);
router.get('/vendas-por-cidade', relatoriosController.vendasPorCidade);
router.get('/vendas-por-categoria', relatoriosController.vendasPorCategoria);

module.exports = router;
