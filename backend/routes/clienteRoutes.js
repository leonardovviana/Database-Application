const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { authMiddleware, requireCliente } = require('../middleware/auth');

router.get('/dashboard', authMiddleware, requireCliente, clienteController.getDashboard);
router.get('/historico', authMiddleware, requireCliente, clienteController.getHistorico);
router.put('/perfil', authMiddleware, requireCliente, clienteController.updatePerfil);
router.put('/senha', authMiddleware, requireCliente, clienteController.updateSenha);
router.get('/favoritos', authMiddleware, requireCliente, clienteController.getFavoritos);
router.post('/favoritos', authMiddleware, requireCliente, clienteController.addFavorito);
router.delete('/favoritos/:veiculo_id', authMiddleware, requireCliente, clienteController.removeFavorito);

module.exports = router;
