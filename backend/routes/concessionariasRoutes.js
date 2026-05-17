const express = require('express');
const router = express.Router();
const concessionariasController = require('../controllers/concessionariasController');
const { validateCreate, validateUpdate } = require('../middleware/validation');

router.get('/busca', concessionariasController.search);
router.get('/', concessionariasController.list);
router.get('/:id', concessionariasController.getById);
router.post('/', validateCreate('concessionarias'), concessionariasController.create);
router.put('/:id', validateUpdate('concessionarias'), concessionariasController.update);
router.delete('/:id', concessionariasController.delete);

module.exports = router;
