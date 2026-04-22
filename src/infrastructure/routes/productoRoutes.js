const express = require('express');
const router = express.Router();
const productoController = require('../controllers/ProductoController');

// POST /api/productos
router.post('/', (req, res) => productoController.crear(req, res));
router.get('/buscar', (req, res) => productoController.buscar(req, res));

module.exports = router;