const express = require('express');
const router = express.Router();
const formularioController = require('../controllers/FormularioController');

// Ruta para obtener inventario por aerolínea (según tu ENUM del DDL)
router.get('/:aerolinea', (req, res) => formularioController.listarPorAerolinea(req, res));

module.exports = router;