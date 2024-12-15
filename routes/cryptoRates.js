const express = require('express');
const getDBConnection = require('../db/connection');
const router = express.Router();

// Получение всех записей курсов криптовалют
router.get('/', async (req, res) => {
  const { role } = req.query;

  if (!role) {
    return res.status(400).json({ message: 'Укажите роль пользователя' });
  }

  try {
    const db = getDBConnection(role);
    const result = await db.query(`
      SELECT cr.RateID, cr.CryptoID, c.Name AS CryptoName, cr.Rate, cr.Time
      FROM CryptoRates cr
      JOIN Cryptocurrencies c ON cr.CryptoID = c.CryptoID
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении курсов криптовалют:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Получение курсов для определенной криптовалюты
router.get('/:cryptoId', async (req, res) => {
  const { role } = req.query;
  const { cryptoId } = req.params;

  if (!role) {
    return res.status(400).json({ message: 'Укажите роль пользователя' });
  }

  try {
    const db = getDBConnection(role);
    const result = await db.query(`
      SELECT cr.RateID, cr.CryptoID, c.Name AS CryptoName, cr.Rate, cr.Time
      FROM CryptoRates cr
      JOIN Cryptocurrencies c ON cr.CryptoID = c.CryptoID
      WHERE cr.CryptoID = $1
    `, [cryptoId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении курса криптовалюты:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Добавление новой записи курса криптовалюты (доступно только администратору)
router.post('/', async (req, res) => {
  const { role } = req.query;
  const { cryptoID, rate } = req.body;

  if (role !== 'Admin') {
    return res.status(403).json({ message: 'У вас нет прав на выполнение этой операции' });
  }

  try {
    const db = getDBConnection(role);
    const result = await db.query(
      'INSERT INTO CryptoRates (CryptoID, Rate) VALUES ($1, $2) RETURNING *',
      [cryptoID, rate]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при добавлении курса криптовалюты:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Удаление записи курса криптовалюты (доступно только администратору)
router.delete('/:rateId', async (req, res) => {
  const { role } = req.query;
  const { rateId } = req.params;

  if (role !== 'Admin') {
    return res.status(403).json({ message: 'У вас нет прав на выполнение этой операции' });
  }

  try {
    const db = getDBConnection(role);
    const result = await db.query('DELETE FROM CryptoRates WHERE RateID = $1 RETURNING *', [rateId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Запись курса криптовалюты не найдена' });
    }
    res.json({ message: 'Запись курса криптовалюты удалена', deletedRecord: result.rows[0] });
  } catch (err) {
    console.error('Ошибка при удалении курса криптовалюты:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;
