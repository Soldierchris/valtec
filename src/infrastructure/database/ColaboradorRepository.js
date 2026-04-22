// src/infrastructure/database/ColaboradorRepository.js
const pool = require('./mariadb');

class ColaboradorRepository {
    async guardar(c) {
        const sql = `
            INSERT INTO colaborador 
            (rut, nombre1, nombre2, apellido1, apellido2, cargo, telefono1, telefono2, mail, sector)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const valores = [
            c.rut, c.nombre1, c.nombre2, c.apellido1, c.apellido2, 
            c.cargo, c.telefono1, c.telefono2, c.mail, c.sector
        ];

        try {
            await pool.query(sql, valores);
            return { éxito: true, mensaje: "Colaborador guardado correctamente" };
        } catch (error) {
            console.error("Error en DB:", error);
            throw error;
        }
    }
}

module.exports = ColaboradorRepository;