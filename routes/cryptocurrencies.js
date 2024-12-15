const express = require('express');
const getDBConnection = require('../db/connection'); // Подключение с учетом ролей
const router = express.Router();

// Получение всех криптовалют
router.get('/', async (req, res) => {
  const { role } = req.query;

  if (!role) {
    return res.status(400).json({ message: 'Укажите роль пользователя' });
  }

  try {
    const db = getDBConnection(role);
    const result = await db.query('SELECT * FROM Cryptocurrencies');
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении криптовалют:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Получение криптовалюты по ID
router.get('/:id', async (req, res) => {
  const { role } = req.query;
  const { id } = req.params;

  if (!role) {
    return res.status(400).json({ message: 'Укажите роль пользователя' });
  }

  try {
    const db = getDBConnection(role);
    const result = await db.query('SELECT * FROM Cryptocurrencies WHERE CryptoID = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Криптовалюта не найдена');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при получении криптовалюты:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Добавление новой криптовалюты
router.post('/', async (req, res) => {
  const { role } = req.query;
  const { name, symbol, marketcap } = req.body;

  if (role !== 'Admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const db = getDBConnection(role);
    const result = await db.query(
      'INSERT INTO Cryptocurrencies (Name, Symbol, MarketCap) VALUES ($1, $2, $3) RETURNING *',
      [name, symbol, marketcap]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при добавлении криптовалюты:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Обновление криптовалюты
router.put('/:id', async (req, res) => {
  const { role } = req.query;
  const { id } = req.params;
  const { name, symbol, marketcap } = req.body;

  if (role !== 'Admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const db = getDBConnection(role);
    const result = await db.query(
      'UPDATE Cryptocurrencies SET Name = $1, Symbol = $2, MarketCap = $3 WHERE CryptoID = $4 RETURNING *',
      [name, symbol, marketcap, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Криптовалюта не найдена');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при обновлении криптовалюты:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Удаление криптовалюты
router.delete('/:id', async (req, res) => {
  const { role } = req.query;
  const { id } = req.params;

  if (role !== 'Admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const db = getDBConnection(role);
    const result = await db.query('DELETE FROM Cryptocurrencies WHERE CryptoID = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send('Криптовалюта не найдена');
    }
    res.send('Криптовалюта удалена');
  } catch (err) {
    console.error('Ошибка при удалении криптовалюты:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;
