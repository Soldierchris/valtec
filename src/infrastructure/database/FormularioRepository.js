const pool = require('./mariadb');
const Formulario = require('../../core/entities/Formulario');

class FormularioRepository {
    async obtenerPorAerolinea(aerolinea) {
        // SQL basado en tu DDL: Une producto con detalle_formulario y calcula stock desde movimientos
        const sql = `
            SELECT 
                p.id_articulo, 
                p.descripcion, 
                df.aerolinea, 
                df.tipo_documento,
                COALESCE(SUM(
                    CASE 
                        WHEN m.tipo_movimiento IN ('Ingreso', 'Devolución') THEN m.cantidad 
                        WHEN m.tipo_movimiento IN ('Entrega', 'Traslado') THEN -m.cantidad 
                        ELSE 0 
                    END
                ), 0) AS stock_disponible
            FROM producto p
            INNER JOIN detalle_formulario df ON p.id_articulo = df.id_articulo
            LEFT JOIN movimiento m ON p.id_articulo = m.id_articulo
            WHERE df.aerolinea = ?
            GROUP BY p.id_articulo
        `;

        try {
            const rows = await pool.query(sql, [aerolinea]);
            // Mapeamos cada fila a nuestra Entidad de Negocio
            return rows.map(row => new Formulario({
                id_articulo: row.id_articulo,
                descripcion: row.descripcion,
                aerolinea: row.aerolinea,
                tipo_documento: row.tipo_documento,
                stock_disponible: row.stock_disponible
            }));
        } catch (error) {
            console.error(`Error al obtener formularios de ${aerolinea}:`, error);
            throw error;
        }
    }
}

module.exports = FormularioRepository;