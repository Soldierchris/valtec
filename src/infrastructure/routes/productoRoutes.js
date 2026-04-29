const express = require('express');
const router = express.Router();
const productoController = require('../controllers/ProductoController');
const ProductoRepository = require('../database/ProductoRepository');
const pool = require('../database/db'); // ← FALTABA ESTO

// POST /api/productos
router.post('/', (req, res) => productoController.crear(req, res));

// GET /api/productos/buscar?q=... (debe ir ANTES de /:id)
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

// GET /api/productos/:id/detalle
router.get('/:id/detalle', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT p.id_articulo, p.descripcion, p.categoria,
                   ds.num_serie, ds.modelo
            FROM producto p
            LEFT JOIN detalle_serializado ds ON p.id_articulo = ds.id_articulo
            WHERE p.id_articulo = ?
        `, [req.params.id]);
        res.json(rows[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;