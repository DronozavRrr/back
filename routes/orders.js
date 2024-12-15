const express = require('express');
const getDBConnection = require('../db/connection');
const router = express.Router();

// Получение всех ордеров
router.get('/', async (req, res) => {
  const { role } = req.query; // Роль передается через query параметр

  if (!role) {
    return res.status(400).json({ message: 'Укажите роль пользователя' });
  }

  try {
    const db = getDBConnection(role); // Подключение на основе роли
    const result = await db.query(`
      SELECT mo.OrderID, mo.UserID, u.Username, mo.CryptoID, c.Name AS CryptoName,
             mo.Type, mo.Amount, mo.Price, mo.StatusID, s.Name AS StatusName, mo."time"
      FROM MarketOrders mo
      JOIN Users u ON mo.UserID = u.UserID
      JOIN Cryptocurrencies c ON mo.CryptoID = c.CryptoID
      JOIN Status s ON mo.StatusID = s.StatusID
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении ордеров:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Получение ордера по ID
router.get('/:id', async (req, res) => {
  const { role } = req.query; // Роль передается через query параметр
  const { id } = req.params;

  if (!role) {
    return res.status(400).json({ message: 'Укажите роль пользователя' });
  }

  try {
    const db = getDBConnection(role); // Подключение на основе роли
    const result = await db.query(`
      SELECT mo.OrderID, mo.UserID, u.Username, mo.CryptoID, c.Name AS CryptoName,
             mo.Type, mo.Amount, mo.Price, mo.StatusID, s.Name AS StatusName, mo."time"
      FROM MarketOrders mo
      JOIN Users u ON mo.UserID = u.UserID
      JOIN Cryptocurrencies c ON mo.CryptoID = c.CryptoID
      JOIN Status s ON mo.StatusID = s.StatusID
      WHERE mo.OrderID = $1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Ордер не найден');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при получении ордера:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Создание нового ордера
router.post('/create', async (req, res) => {
  const { role } = req.query;
  const { userID, cryptoID, type, amount, price } = req.body;

  if (role !== 'Admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const db = getDBConnection(role);
    const query = `
      INSERT INTO MarketOrders (UserID, CryptoID, Type, Amount, Price, StatusID)
      VALUES ($1, $2, $3, $4, $5, 1) RETURNING *
    `;
    const result = await db.query(query, [userID, cryptoID, type, amount, price]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при создании ордера:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});


// Обновление ордера
router.put('/:id/update', async (req, res) => {
  const { role } = req.query;
  const { id } = req.params;
  const { amount, price } = req.body;

  if (role !== 'Admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const db = getDBConnection(role);
    const query = `
      UPDATE MarketOrders
      SET Amount = $1, Price = $2
      WHERE OrderID = $3 RETURNING *
    `;
    const result = await db.query(query, [amount, price, id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Ордер не найден');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при обновлении ордера:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});


// Удаление ордера
router.delete('/:id', async (req, res) => {
  const { role } = req.query; // Роль передается через query параметр
  const { id } = req.params;

  if (role !== 'Admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const db = getDBConnection(role); // Подключение на основе роли
    const result = await db.query('DELETE FROM MarketOrders WHERE OrderID = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send('Ордер не найден');
    }
    res.send('Ордер удален');
  } catch (err) {
    console.error('Ошибка при удалении ордера:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;
