// ============================================================
// notificacionRoutes.js
// Endpoints para el selector de destinatarios CC del correo.
// ============================================================

const express = require('express');
const router  = express.Router();
//const pool    = require('./src/infrastructure/database/db');
const pool = require('../database/db');

/**
 * GET /api/notificaciones/destinatarios?q=texto
 * Busca colaboradores con email para copiar en notificaciones.
 * Devuelve solo los que tienen mail registrado.
 */
router.get('/destinatarios', async (req, res) => {
    const q = (req.query.q || '').trim();
    if (q.length < 2) return res.json([]);

    try {
        const [rows] = await pool.execute(`
            SELECT 
                rut,
                CONCAT(nombre1, ' ', COALESCE(nombre2, ''), ' ', apellido1, ' ', COALESCE(apellido2, '')) AS nombre_completo,
                cargo,
                sector,
                mail
            FROM colaborador
            WHERE mail IS NOT NULL
              AND mail != ''
              AND (
                  rut      LIKE ? OR
                  nombre1  LIKE ? OR
                  apellido1 LIKE ? OR
                  mail     LIKE ?
              )
            ORDER BY apellido1, nombre1
            LIMIT 10
        `, [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]);

        // Limpiar espacios dobles del nombre
        const limpios = rows.map(r => ({
            ...r,
            nombre_completo: r.nombre_completo.replace(/\s+/g, ' ').trim(),
        }));

        res.json(limpios);
    } catch (error) {
        console.error('[notificacionRoutes] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;