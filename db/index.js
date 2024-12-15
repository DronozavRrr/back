const { Pool } = require('pg');
require('dotenv').config();

// Настраиваем подключение к PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

console.log('Подключение к базе данных с параметрами: ', {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
  

// Экспорт функции для выполнения запросов
module.exports = {
  query: (text, params) => pool.query(text, params),
};
