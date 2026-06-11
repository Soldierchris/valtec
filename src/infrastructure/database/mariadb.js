// src/infrastructure/database/mariadb.js
require('dotenv').config();
const pool = require('./db');

module.exports = {
    query: async (text, params) => {
        const [rows] = await pool.query(text, params);
        return rows;
    }
};