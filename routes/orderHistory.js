const express = require('express');
const getDBConnection = require('../db/connection');
const router = express.Router();

// Получение всей истории ордеров
router.get('/', async (req, res) => {
  const { role } = req.query;

  if (!role) {
    return res.status(400).json({ message: 'Укажите роль пользователя' });
  }

  try {
    const db = getDBConnection(role);
    const result = await db.query(`
      SELECT oh.HistoryID, oh.OrderID, oh.StatusID, s.Name AS StatusName, oh.Time
      FROM OrderHistory oh
      JOIN Status s ON oh.StatusID = s.StatusID
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении истории ордеров:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Получение истории ордера по OrderID
router.get('/:orderId', async (req, res) => {
  const { role } = req.query;
  const { orderId } = req.params;

  if (!role) {
    return res.status(400).json({ message: 'Укажите роль пользователя' });
  }

  try {
    const db = getDBConnection(role);
    const result = await db.query(`
      SELECT oh.HistoryID, oh.OrderID, oh.StatusID, s.Name AS StatusName, oh.Time
      FROM OrderHistory oh
      JOIN Status s ON oh.StatusID = s.StatusID
      WHERE oh.OrderID = $1
    `, [orderId]);
    if (result.rows.length === 0) {
      return res.status(404).send('История ордера не найдена');
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении истории ордера:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});
router.post('/', async (req, res) => {
  const { role } = req.query;
  const { orderid, statusid, time } = req.body;

  if (role !== 'Admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const db = getDBConnection(role);
    const query = `
      INSERT INTO OrderHistory (OrderID, StatusID, Time)
      VALUES ($1, $2, $3) RETURNING *`;
    const result = await db.query(query, [orderid, statusid, time]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при добавлении записи в историю:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});
// Обновление записи в истории
router.put('/:id', async (req, res) => {
  const { role } = req.query;
  const { id } = req.params;
  const { orderId, statusId, time } = req.body;

  if (role !== 'Admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const db = getDBConnection(role);
    const query = `
      UPDATE OrderHistory
      SET OrderID = $1, StatusID = $2, Time = $3
      WHERE HistoryID = $4 RETURNING *
    `;
    const result = await db.query(query, [orderId, statusId, time, id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Запись не найдена');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при обновлении записи в истории:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Удаление записи в истории
router.delete('/:id', async (req, res) => {
  const { role } = req.query;
  const { id } = req.params;

  if (role !== 'Admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const db = getDBConnection(role);
    const result = await db.query('DELETE FROM OrderHistory WHERE HistoryID = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send('Запись не найдена');
    }
    res.send('Запись удалена');
  } catch (err) {
    console.error('Ошибка при удалении записи из истории:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;
