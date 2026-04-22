// src/infrastructure/database/ProductoRepository.js
const pool = require('./db'); // Asegúrate de que apunte a tu nuevo archivo db.js

class ProductoRepository {
    // ELIMINAMOS la palabra 'function' aquí
    async guardar(p) {
        try {
            // 1. Inserción base en tabla producto
            const sqlProd = "INSERT INTO producto (descripcion, categoria) VALUES (?, ?)";
            const [resProd] = await pool.execute(sqlProd, [p.descripcion, p.categoria]);
            const idGenerado = resProd.insertId;

            // 2. Lógica condicional según Categoría (DDL)
            if (p.categoria === 'Tablet' || p.categoria === 'Seguridad') {
                await pool.execute(
                    "INSERT INTO detalle_serializado (id_articulo, num_serie, modelo) VALUES (?, ?, ?)",
                    [idGenerado, p.num_serie, p.modelo]
                );
            } 
            else if (p.categoria === 'Formulario') {
                await pool.execute(
                    "INSERT INTO detalle_formulario (id_articulo, aerolinea, tipo_documento) VALUES (?, ?, ?)",
                    [idGenerado, p.aerolinea, p.tipo_documento]
                );
            } 
            else if (p.categoria === 'Suministro') {
                await pool.execute(
                    "INSERT INTO detalle_suministro (id_articulo, marca, medida) VALUES (?, ?, ?)",
                    [idGenerado, p.marca, p.medida]
                );
            }

            return { exito: true, id: idGenerado };
        } catch (error) {
            console.error("Error al guardar:", error);
            throw error;
        }
    }
}

module.exports = ProductoRepository;