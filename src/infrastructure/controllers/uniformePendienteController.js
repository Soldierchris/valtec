// ============================================================
// src/infrastructure/controllers/uniformePendienteController.js
//
// Usa directamente emailService.js de VALTEC — sin crear
// un transporter propio. Consistente con movimientoRoutes.js
// ============================================================

const path = require('path');
const repo = require('../database/uniformePendienteRepository');

// Mismo import que usa movimientoRoutes.js
const { notificarEntrega } = require(path.resolve(__dirname, '../../../emailService'));

// ── GET /api/uniformes-pendientes ─────────────────────────────
async function listar(req, res) {
    try {
        const pendientes = await repo.listarPendientes();
        res.json(pendientes);
    } catch (err) {
        console.error('[uniformes] Error al listar:', err);
        res.status(500).json({ error: 'Error al obtener los pendientes' });
    }
}

// ── POST /api/uniformes-pendientes ────────────────────────────
async function crear(req, res) {
    const { colaborador_rut, descripcion } = req.body;

    if (!colaborador_rut) {
        return res.status(400).json({ error: 'El RUT del colaborador es requerido' });
    }

    try {
        const id = await repo.crear({ colaborador_rut, descripcion });
        res.status(201).json({ id, mensaje: 'Registro creado correctamente' });
    } catch (err) {
        console.error('[uniformes] Error al crear:', err);
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ error: 'El RUT ingresado no existe en el sistema' });
        }
        res.status(500).json({ error: 'Error al crear el registro' });
    }
}

// ── POST /api/uniformes-pendientes/:id/notificar ──────────────
async function notificar(req, res) {
    const { id } = req.params;

    try {
        const registro = await repo.obtenerPorId(id);

        if (!registro) {
            return res.status(404).json({ error: 'Registro no encontrado o ya cerrado' });
        }

        if (!registro.mail) {
            return res.status(400).json({
                error: `${registro.nombre1} ${registro.apellido1} no tiene correo registrado en el sistema`
            });
        }

        // ── Reutiliza notificarEntrega() de emailService.js ───
        // Le pasamos los campos que espera la función, adaptados
        // al contexto de uniforme pendiente.
        // notificarEntrega es fire-and-forget en movimientoRoutes,
        // aquí hacemos await para saber si el correo llegó antes
        // de incrementar el contador.
        await notificarEntrega({
            descripcion:       registro.descripcion || 'Artículo pendiente de retiro',
            codigo:            `Pendiente #${registro.id}`,
            custodio:          `${registro.nombre1} ${registro.apellido1}`,
            rut:               registro.colaborador_rut,
            sector:            registro.sector   || null,
            ubicacion:         'Bodega Central',
            cantidad:          null,             // no aplica para uniformes
            mailColaborador:   registro.mail,    // → campo "to" en emailService
            cc:                [],               // sin copia adicional por ahora
            // Override del asunto y nota — emailService usa htmlBase() internamente
            // El asunto lo controla emailService: "[VALTEC] Entrega registrada — ..."
            // Si en el futuro quieres un asunto personalizado, agrega un campo
            // "asunto" en emailService.js y lo pasas aquí.
        });

        // Solo incrementamos si el correo no lanzó excepción
        await repo.incrementarNotificaciones(id);

        res.json({ mensaje: 'Notificación enviada correctamente' });

    } catch (err) {
        console.error('[uniformes] Error al notificar:', err);

        // Si el error fue del correo, el contador NO sube
        // Si fue de la DB, tampoco — consistencia garantizada
        if (err.message?.includes('mail') || err.message?.includes('SMTP') || err.message?.includes('connect')) {
            return res.status(502).json({ error: 'Error al enviar el correo. Verifique configuración SMTP.' });
        }
        res.status(500).json({ error: 'Error al procesar la notificación' });
    }
}

// ── POST /api/uniformes-pendientes/:id/cerrar ─────────────────
async function cerrar(req, res) {
    const { id } = req.params;

    try {
        const ok = await repo.cerrar(id);
        if (!ok) {
            return res.status(404).json({ error: 'Registro no encontrado o ya estaba cerrado' });
        }
        res.json({ mensaje: 'Registro cerrado correctamente' });
    } catch (err) {
        console.error('[uniformes] Error al cerrar:', err);
        res.status(500).json({ error: 'Error al cerrar el registro' });
    }
}

module.exports = { listar, crear, notificar, cerrar };