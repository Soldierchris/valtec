const express = require('express');
const router = express.Router();
const pool = require('../database/db'); 

// --- RUTA 1: REGISTRO GENERAL (INGRESOS) ---
router.post('/', async (req, res) => {
    const { id_articulo, tipo_movimiento, cantidad, ubicacion, serie, modelo, aerolinea } = req.body;
    
    const query = `
        INSERT INTO movimiento (id_articulo, tipo_movimiento, cantidad, ubicacion, serie, modelo, aerolinea, fecha_movimiento)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    try {
        const [result] = await pool.execute(query, [
            id_articulo, 
            tipo_movimiento || 'INGRESO', 
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

// --- RUTA 2: ENTREGA A COLABORADOR (EGRESO CON RESTA DE STOCK) ---
router.post('/entrega', async (req, res) => {
    const { id_articulo, cantidad, ubicacion, rut_colaborador, id_usuario_bodega } = req.body;

    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. VALIDACIÓN DE STOCK
        const [rows] = await connection.execute(
            'SELECT stock FROM articulos WHERE id_articulo = ?', 
            [id_articulo]
        );

        if (rows.length === 0) throw new Error("El producto no existe.");
        if (rows[0].stock < cantidad) throw new Error(`Stock insuficiente. Disponible: ${rows[0].stock}`);

        // 2. REGISTRO DEL MOVIMIENTO (EGRESO)
        // Usamos id_usuario_bodega para que coincida con tu tabla de usuarios
        const sqlMov = `
            INSERT INTO movimiento (
                id_articulo, tipo_movimiento, cantidad, ubicacion, 
                rut_colaborador, id_usuario, fecha_movimiento
            )
            VALUES (?, 'EGRESO', ?, ?, ?, ?, NOW())
        `;
        await connection.execute(sqlMov, [
            id_articulo, 
            cantidad, 
            ubicacion, 
            rut_colaborador, 
            id_usuario_bodega || 1 // 1 es el Admin/Bodeguero por defecto
        ]);

        // 3. ACTUALIZACIÓN DE STOCK (RESTA)
        const sqlUpdateStock = `
            UPDATE articulos 
            SET stock = stock - ? 
            WHERE id_articulo = ?
        `;
        await connection.execute(sqlUpdateStock, [cantidad, id_articulo]);

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

module.exports = router;