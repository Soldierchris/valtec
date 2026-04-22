const pool = require('./db'); // Tu conexión a MariaDB

class MovimientoRepository {
    async registrar(datos) {
        try {
            const { id_articulo, tipo_movimiento, cantidad, ubicacion, serie, modelo, aerolinea } = datos;
            
            const sql = `
                INSERT INTO movimientos 
                (id_articulo, tipo_movimiento, cantidad, ubicacion, serie, modelo, aerolinea, fecha) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            
            const [result] = await pool.execute(sql, [
                id_articulo, 
                tipo_movimiento, 
                cantidad, 
                ubicacion, 
                serie || null, 
                modelo || null, 
                aerolinea || null
            ]);
            
            return result;
        } catch (error) {
            console.error("Error SQL en MovimientoRepository:", error);
            throw error;
        }
    }
}

module.exports = MovimientoRepository;