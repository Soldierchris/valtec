const mariadb = require('mariadb');
require('dotenv').config();

const pool = require('./db');

module.exports = {
    query: (text, params) => pool.execute(text, params).then(([rows]) => rows)
};

module.exports = {
    query: (text, params) => pool.query(text, params)
};