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

// GET /api/productos/:id/ubicacion-actual
// Devuelve la bodega donde está actualmente el producto (último ingreso o devolución)
router.get('/:id/ubicacion-actual', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                m.ubicacion,
                m.tipo_movimiento,
                m.fecha_movimiento,
                -- Stock disponible en esa ubicación
                (
                    SELECT 
                        COALESCE(SUM(CASE WHEN m2.tipo_movimiento IN ('Ingreso','Devolución') THEN m2.cantidad ELSE 0 END), 0) -
                        COALESCE(SUM(CASE WHEN m2.tipo_movimiento = 'Entrega' THEN m2.cantidad ELSE 0 END), 0)
                    FROM movimiento m2
                    WHERE m2.id_articulo = m.id_articulo
                      AND m2.ubicacion = m.ubicacion
                ) AS stock_en_bodega
            FROM movimiento m
            WHERE m.id_articulo = ?
              AND m.tipo_movimiento IN ('Ingreso', 'Devolución')
            ORDER BY m.fecha_movimiento DESC
            LIMIT 1
        `, [req.params.id]);
        res.json(rows[0] || { ubicacion: null, stock_en_bodega: 0 });
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