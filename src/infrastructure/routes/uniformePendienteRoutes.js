// ============================================================
// src/infrastructure/routes/uniformePendienteRoutes.js
//
// Patrón idéntico a movimientoRoutes.js, colaboradorRoutes.js, etc.
// ============================================================

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/uniformePendienteController');

// GET    /api/uniformes-pendientes           → listar activos
router.get('/', controller.listar);

// POST   /api/uniformes-pendientes           → crear registro
router.post('/', controller.crear);

// PUT    /api/uniformes-pendientes/:id       → actualizar descripción (NUEVO)
router.put('/:id', controller.actualizar);

// POST   /api/uniformes-pendientes/:id/notificar → correo + contador +1
router.post('/:id/notificar', controller.notificar);

// POST   /api/uniformes-pendientes/:id/cerrar    → congelar y sacar de lista
router.post('/:id/cerrar', controller.cerrar);

module.exports = router;