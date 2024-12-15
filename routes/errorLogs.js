const express = require('express');
const getDBConnection = require('../db/connection');
const router = express.Router();

// Получение журнала ошибок
router.get('/', async (req, res) => {
  try {
    const db = getDBConnection('Admin'); // Только администраторы могут видеть журнал ошибок
    const result = await db.query('SELECT * FROM ErrorLogs ORDER BY LogTime DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении журнала ошибок:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;
