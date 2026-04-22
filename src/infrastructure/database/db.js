// src/infrastructure/database/db.js
require('dotenv').config(); // Carga las variables de .env
const mysql = require('mysql2/promise'); // IMPORTANTE: usar /promise para evitar el error de función

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;