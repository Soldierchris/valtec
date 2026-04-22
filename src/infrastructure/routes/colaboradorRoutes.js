const express = require('express');
const router = express.Router();
const colaboradorController = require('../controllers/ColaboradorController');

// Ruta: POST /api/colaboradores
router.post('/', (req, res) => colaboradorController.crear(req, res));

module.exports = router;