const express = require('express');
const router = express.Router();
const colaboradorController = require('../controllers/ColaboradorController');
const pool = require('../database/db'); // ← AGREGAR

// POST /api/colaboradores
router.post('/', (req, res) => colaboradorController.crear(req, res));

// GET /api/colaboradores/buscar?q=... ← RUTA QUE FALTABA
router.get('/buscar', async (req, res) => {
    try {
        const q = req.query.q || '';
        const [rows] = await pool.execute(`
            SELECT rut, nombre1, nombre2, apellido1, apellido2, cargo, sector
            FROM colaborador
            WHERE rut LIKE ? OR nombre1 LIKE ? OR apellido1 LIKE ?
            LIMIT 10
        `, [`%${q}%`, `%${q}%`, `%${q}%`]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;