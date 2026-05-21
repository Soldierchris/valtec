const express = require('express');
const router = express.Router();
const pool = require('../database/db');

// --- RUTA 1: INGRESO GENERAL (POST /) ---
router.post('/', async (req, res) => {
    const { id_articulo, tipo_movimiento, cantidad, ubicacion, serie, modelo, aerolinea } = req.body;
    const query = `
        INSERT INTO movimiento (id_articulo, tipo_movimiento, cantidad, ubicacion, serie, modelo, aerolinea, fecha_movimiento)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    try {
        const [result] = await pool.execute(query, [
            id_articulo,
            tipo_movimiento || 'Ingreso',
            cantidad,
            ubicacion,
            serie || null,
            modelo || null,
            aerolinea || null
        ]);
        res.status(201).json({ message: "Guardado correctamente", id: result.insertId });
    } catch (error) {
        console.error("Error en DB:", error);
        res.status(500).json({ error: "Error al insertar: " + error.message });
    }
});

// --- RUTA 2: INGRESO DESDE MODAL ---
router.post('/ingreso', async (req, res) => {
    const { id_articulo, tipo_movimiento, cantidad, ubicacion, serie, modelo, aerolinea } = req.body;
    const query = `
        INSERT INTO movimiento (id_articulo, tipo_movimiento, cantidad, ubicacion, serie, modelo, aerolinea, fecha_movimiento)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    try {
        const [result] = await pool.execute(query, [
            id_articulo,
            tipo_movimiento || 'Ingreso',
            cantidad,
            ubicacion,
            serie || null,
            modelo || null,
            aerolinea || null
        ]);
        res.status(201).json({ message: "Guardado correctamente", id: result.insertId });
    } catch (error) {
        console.error("Error en DB:", error);
        res.status(500).json({ error: "Error al insertar: " + error.message });
    }
});

// --- RUTA 3: ENTREGA A COLABORADOR ---
// --- RUTA 3: ENTREGA A COLABORADOR ---
router.post('/entrega', async (req, res) => {
    const { id_articulo, cantidad, ubicacion, rut_colaborador, id_usuario_bodega, serie, modelo } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. VALIDACIÓN DE STOCK
        const [rows] = await connection.execute(
            `SELECT 
                p.id_articulo,
                COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'Ingreso'    THEN m.cantidad ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'Entrega'    THEN m.cantidad ELSE 0 END), 0) +
                COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'Devolución' THEN m.cantidad ELSE 0 END), 0)
                AS stock_actual
            FROM producto p
            LEFT JOIN movimiento m ON p.id_articulo = m.id_articulo
            WHERE p.id_articulo = ?
            GROUP BY p.id_articulo`,
            [id_articulo]
        );

        if (rows.length === 0) throw new Error("El producto no existe.");
        if (rows[0].stock_actual < cantidad) throw new Error(`Stock insuficiente. Disponible: ${rows[0].stock_actual}`);

        // 2. REGISTRO DEL MOVIMIENTO — ahora incluye serie y modelo
        await connection.execute(
            `INSERT INTO movimiento 
                (id_articulo, tipo_movimiento, cantidad, ubicacion, rut_colaborador, id_usuario, serie, modelo, fecha_movimiento)
             VALUES (?, 'Entrega', ?, ?, ?, ?, ?, ?, NOW())`,
            [id_articulo, cantidad, ubicacion, rut_colaborador, id_usuario_bodega || 1, serie || null, modelo || null]
        );

        await connection.commit();
        res.status(201).json({ message: "Entrega registrada exitosamente" });

    } catch (error) {
        await connection.rollback();
        console.error("Error en Transacción:", error);
        res.status(400).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// --- RUTA 4: DEVOLUCIÓN ---
router.post('/devolucion', async (req, res) => {
    const { id_articulo, rut_colaborador, serie, ubicacion, observacion } = req.body;
    if (!id_articulo || !rut_colaborador) {
        return res.status(400).json({ error: "Faltan datos obligatorios." });
    }
    try {
        await pool.execute(
            `INSERT INTO movimiento (id_articulo, tipo_movimiento, cantidad, ubicacion, serie, rut_colaborador, observacion, fecha_movimiento)
             VALUES (?, 'Devolución', 1, ?, ?, ?, ?, NOW())`,
            [id_articulo, ubicacion, serie || null, rut_colaborador, observacion || null]
        );
        res.status(201).json({ message: "Devolución registrada exitosamente" });
    } catch (error) {
        console.error("Error en devolución:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- RUTA 5: INVENTARIO BODEGA SEGURIDAD ---
router.get('/bodega-seguridad', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                p.id_articulo,
                p.descripcion,
                ds.num_serie,
                ds.modelo,
                COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'Ingreso'    THEN m.cantidad ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'Entrega'    THEN m.cantidad ELSE 0 END), 0) +
                COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'Devolución' THEN m.cantidad ELSE 0 END), 0)
                AS stock_disponible
            FROM producto p
            LEFT JOIN detalle_serializado ds ON p.id_articulo = ds.id_articulo
            INNER JOIN movimiento m ON p.id_articulo = m.id_articulo
            WHERE m.ubicacion = 'Bodega Seguridad'
            GROUP BY p.id_articulo, p.descripcion, ds.num_serie, ds.modelo
            ORDER BY p.id_articulo
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error bodega seguridad:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- RUTA 6: TRAZABILIDAD POR SERIE ---
router.get('/trazabilidad/:serie', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                m.id_movimiento,
                m.tipo_movimiento,
                m.fecha_movimiento,
                m.ubicacion,
                m.serie,
                m.observacion,
                p.descripcion,
                p.categoria,
                CONCAT(c.nombre1, ' ', c.apellido1) AS nombre_colaborador,
                c.rut AS rut_colaborador,
                c.cargo
            FROM movimiento m
            JOIN producto p ON m.id_articulo = p.id_articulo
            LEFT JOIN colaborador c ON m.rut_colaborador = c.rut
            WHERE m.serie = ?
            ORDER BY m.fecha_movimiento ASC
        `, [req.params.serie]);
        res.json(rows);
    } catch (error) {
        console.error("Error trazabilidad:", error);
        res.status(500).json({ error: error.message });
    }
});
// --- RUTA: INVENTARIO BODEGA GRANDE ---
router.get('/bodega-grande', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                p.id_articulo,
                p.descripcion,
                p.categoria,
                ds.num_serie,
                ds.modelo,
                COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'Ingreso'    THEN m.cantidad ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'Entrega'    THEN m.cantidad ELSE 0 END), 0) +
                COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'Devolución' THEN m.cantidad ELSE 0 END), 0)
                AS stock_disponible
            FROM producto p
            LEFT JOIN detalle_serializado ds ON p.id_articulo = ds.id_articulo
            INNER JOIN movimiento m ON p.id_articulo = m.id_articulo
            WHERE m.ubicacion = 'Bodega Grande'
            GROUP BY p.id_articulo, p.descripcion, p.categoria, ds.num_serie, ds.modelo
            HAVING stock_disponible > 0
            ORDER BY p.categoria, p.id_articulo
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error bodega grande:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- RUTA: ACTIVOS EN CUSTODIA POR COLABORADOR ---
router.get('/custodia/:rut', async (req, res) => {
    const rut = req.params.rut;
    try {
        const [rows] = await pool.execute(`
            SELECT 
                p.descripcion,
                p.categoria,
                m.serie,
                m.modelo,
                m.fecha_movimiento,
                DATEDIFF(NOW(), m.fecha_movimiento) AS dias_en_custodia,
                m.ubicacion
            FROM movimiento m
            JOIN producto p ON m.id_articulo = p.id_articulo
            WHERE m.tipo_movimiento = 'Entrega'
              AND m.rut_colaborador = ?
              AND (
                  -- Activos con serie: no existe devolución posterior
                  (m.serie IS NOT NULL AND NOT EXISTS (
                      SELECT 1 FROM movimiento m2
                      WHERE m2.serie = m.serie
                        AND m2.tipo_movimiento = 'Devolución'
                        AND m2.fecha_movimiento > m.fecha_movimiento
                  ))
                  OR
                  -- Activos sin serie: balance positivo de entregas vs devoluciones
                  (m.serie IS NULL AND (
                      SELECT 
                          COALESCE(SUM(CASE WHEN m3.tipo_movimiento = 'Entrega' THEN m3.cantidad ELSE 0 END), 0) -
                          COALESCE(SUM(CASE WHEN m3.tipo_movimiento = 'Devolución' THEN m3.cantidad ELSE 0 END), 0)
                      FROM movimiento m3
                      WHERE m3.id_articulo = m.id_articulo
                        AND m3.rut_colaborador = ?
                  ) > 0)
              )
            ORDER BY m.fecha_movimiento DESC
        `, [rut, rut]);

        res.json(rows);
    } catch (error) {
        console.error("Error custodia:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;