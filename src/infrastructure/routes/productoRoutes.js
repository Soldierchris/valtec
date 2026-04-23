const express = require('express');
const router = express.Router();
const productoController = require('../controllers/ProductoController');
const ProductoRepository = require('../../infrastructure/database/ProductoRepository'); // ← ESTO FALTABA

// POST /api/productos
router.post('/', (req, res) => productoController.crear(req, res));

// GET /api/productos/buscar?q=...
router.get('/buscar', async (req, res) => {
    try {
        const q = req.query.q || '';
        const repo = new ProductoRepository();
        const productos = await repo.buscar(q);
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;