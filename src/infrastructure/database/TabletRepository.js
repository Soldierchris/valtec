const pool = require('./mariadb');
const Tablet = require('../../core/entities/tablet');

class TabletRepository {
    async obtenerTodas() {
        /*
        const sql = `
            SELECT 
                p.id_articulo, 
                ds.num_serie, 
                ds.modelo, 
                p.descripcion, 
                COALESCE(m.estado, 'Disponible') as estado
                
            FROM producto p
            INNER JOIN detalle_serializado ds ON p.id_articulo = ds.id_articulo
            LEFT JOIN (
                SELECT m1.id_articulo, m1.estado 
                FROM movimiento m1
                WHERE m1.id_movimiento = (
                    SELECT MAX(m2.id_movimiento) 
                    FROM movimiento m2 
                    WHERE m2.id_articulo = m1.id_articulo
                )
            ) m ON p.id_articulo = m.id_articulo
            WHERE p.categoria = 'Tablet'
        `;
*/

const sql = `
    SELECT 
        p.id_articulo, 
        ds.num_serie, 
        ds.modelo, 
        p.descripcion, 
        COALESCE(m.cantidad, 1) AS cantidad, 
        COALESCE(m.estado, 'Disponible') AS estado,
        COALESCE(m.ubicacion, 'Sin asignar') AS ubicacion
    FROM producto p
    INNER JOIN detalle_serializado ds ON p.id_articulo = ds.id_articulo
    LEFT JOIN movimiento m ON m.id_movimiento = (
        SELECT MAX(m2.id_movimiento) 
        FROM movimiento m2 
        WHERE m2.id_articulo = p.id_articulo
    )
    WHERE p.categoria = 'Tablet'
`;
        try {
            const rows = await pool.query(sql);
            return rows.map(row => new Tablet(row));
        } catch (error) {
            console.error("Error en TabletRepository:", error);
            throw error;
        }
    }
}

module.exports = TabletRepository;