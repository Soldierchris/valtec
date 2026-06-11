// src/infrastructure/database/db.js
require('dotenv').config(); // Carga las variables de .env
const mysql = require('mysql2/promise'); // IMPORTANTE: usar /promise para evitar el error de función

const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    authPlugins: {
        // Ignorar plugin GSSAPI que mysql2 no soporta nativamente
        auth_gssapi_client: () => () => Buffer.alloc(0),
    },
});

module.exports = pool;