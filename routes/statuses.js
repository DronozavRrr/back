const express = require('express');
const getDBConnection = require('../db/connection'); // Подключение с учетом ролей
const router = express.Router();

// Получение всех статусов
router.get('/', async (req, res) => {
  const { role } = req.query;

  if (!role) {
    return res.status(400).json({ message: 'Укажите роль пользователя' });
  }

  try {
    const db = getDBConnection(role); // Учет роли
    const result = await db.query('SELECT * FROM Status');
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении статусов:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Получение статуса по ID
router.get('/:id', async (req, res) => {
  const { role } = req.query;
  const { id } = req.params;

  if (!role) {
    return res.status(400).json({ message: 'Укажите роль пользователя' });
  }

  try {
    const db = getDBConnection(role);
    const result = await db.query('SELECT * FROM Status WHERE StatusID = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Статус не найден');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при получении статуса:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Создание нового статуса
router.post('/', async (req, res) => {
  const { role } = req.query;
  const { name, description } = req.body;

  if (role !== 'Admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const db = getDBConnection(role);
    const query = `
      INSERT INTO Status (Name, Description)
      VALUES ($1, $2) RETURNING *`;
    const result = await db.query(query, [name, description]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при создании статуса:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Обновление статуса
router.put('/:id', async (req, res) => {
  const { role } = req.query;
  const { id } = req.params;
  const { name, description } = req.body;

  if (role !== 'Admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const db = getDBConnection(role);
    const query = `
      UPDATE Status
      SET Name = $1, Description = $2
      WHERE StatusID = $3 RETURNING *`;
    const result = await db.query(query, [name, description, id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Статус не найден');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при обновлении статуса:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Удаление статуса
router.delete('/:id', async (req, res) => {
  const { role } = req.query;
  const { id } = req.params;

  if (role !== 'Admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const db = getDBConnection(role);
    const result = await db.query('DELETE FROM Status WHERE StatusID = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send('Статус не найден');
    }
    res.send('Статус удален');
  } catch (err) {
    console.error('Ошибка при удалении статуса:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;
