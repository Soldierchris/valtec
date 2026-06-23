// ============================================================
// src/infrastructure/database/uniformePendienteRepository.js
//
// Patrón idéntico a ColaboradorRepository.js, TabletRepository.js, etc.
// Usa el pool de db.js (mysql2/promise) — igual que movimientoRoutes.js
// ============================================================

const pool = require('./db'); // mismo archivo que usa el resto de VALTEC

// ── Listar todos los pendientes activos ───────────────────────
async function listarPendientes() {
    const [rows] = await pool.execute(`
        SELECT
            up.id,
            up.colaborador_rut,
          TRIM(CONCAT(
    c.nombre1, ' ',
    c.apellido1, ' ',
    COALESCE(NULLIF(c.apellido2,''), '')
)) AS nombre_completo,
            c.sector,
            c.mail,
            up.descripcion,
            up.fecha_ingreso,
            up.notificaciones,
            DATEDIFF(CURDATE(), up.fecha_ingreso) AS dias_en_bodega
        FROM uniforme_pendiente up
        JOIN colaborador c ON c.rut = up.colaborador_rut
        WHERE up.cerrado = 0
        ORDER BY up.fecha_ingreso ASC
    `);
    return rows;
}

// ── Crear nuevo registro ──────────────────────────────────────
async function crear({ colaborador_rut, descripcion }) {
    const fecha_ingreso = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const [result] = await pool.execute(
        `INSERT INTO uniforme_pendiente (colaborador_rut, descripcion, fecha_ingreso)
         VALUES (?, ?, ?)`,
        [colaborador_rut, descripcion || 'Artículo pendiente de retiro', fecha_ingreso]
    );
    return result.insertId;
}

// ── Incrementar contador de notificaciones ────────────────────
async function incrementarNotificaciones(id) {
    const [result] = await pool.execute(
        `UPDATE uniforme_pendiente
         SET notificaciones = notificaciones + 1
         WHERE id = ? AND cerrado = 0`,
        [id]
    );
    return result.affectedRows > 0;
}

// ── Cerrar registro: congela el tiempo ────────────────────────
async function cerrar(id) {
    const [result] = await pool.execute(
        `UPDATE uniforme_pendiente
         SET cerrado      = 1,
             fecha_cierre = CURDATE()
         WHERE id = ? AND cerrado = 0`,
        [id]
    );
    return result.affectedRows > 0;
}

// ── Obtener por ID (para notificaciones) ─────────────────────
async function obtenerPorId(id) {
    const [rows] = await pool.execute(`
        SELECT
            up.*,
            c.mail,
            c.nombre1,
            c.apellido1,
            c.sector
        FROM uniforme_pendiente up
        JOIN colaborador c ON c.rut = up.colaborador_rut
        WHERE up.id = ?
    `, [id]);
    return rows[0] || null;
}

// ── Actualizar descripcion ───────────────────────────────────
async function actualizarDescripcion(id, descripcion) {
    const [result] = await pool.execute(
        `UPDATE uniforme_pendiente
         SET descripcion = ?
         WHERE id = ? AND cerrado = 0`,
        [descripcion, id]
    );
    return result.affectedRows > 0;
}

// Asegúrate de agregarlo a los exports al final del archivo:
module.exports = {
    listarPendientes,
    crear,
    incrementarNotificaciones,
    cerrar,
    obtenerPorId,
    actualizarDescripcion // ← NUEVO
};
