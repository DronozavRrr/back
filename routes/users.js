const express = require('express');
const db = require('../db'); // Импорт файла db/index.js
const router = express.Router();
const verifyToken = require('./auth');
const getDBConnection = require('../db/connection'); // Импортируем функцию подключения
const roleMiddleware = require('../middleware/roleMiddleware');

// Получение всех пользователей
router.get('/', async (req, res) => {
    const { role } = req.query; // Роль передается через query параметр
  
    if (!role) {
      return res.status(400).json({ message: 'Укажите роль пользователя' });
    }
  
    try {
      const db = getDBConnection(role); 
      const result = await db.query('SELECT * FROM Users'); 
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Ошибка сервера или доступа к таблице');
    }
  });
router.post('/register', async (req, res) => {
    const { username, password, email, role } = req.body;
  
    try {
      const result = await db.query(
        'SELECT RegisterUser($1, $2, $3, $4)',
        [username, password, email, role]
      );
      res.status(201).json({ message: 'Пользователь зарегистрирован успешно' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Ошибка при регистрации пользователя');
    }
  });

  
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, password, role } = req.body;
  
    if (!username || !email || !role) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }
  
    try {
      const query = `
        UPDATE Users
        SET Username = $1, Email = $2, Password = $3, Role = $4
        WHERE UserID = $5 RETURNING *`;
      const values = [username, email, password, role, id];
      const result = await db.query(query, values);
  
      if (result.rows.length === 0) {
        return res.status(404).send('Пользователь не найден');
      }
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Ошибка сервера');
    }
  });


// Получение пользователя по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM Users WHERE UserID = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Пользователь не найден');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Создание нового пользователя
router.post('/', async (req, res) => {
  const { username, password, email, role } = req.body;
  try {
    const query = `
      INSERT INTO Users (Username, Password, Email, Role)
      VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [username, password, email, role];
    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Удаление пользователя
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM Users WHERE UserID = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send('Пользователь не найден');
    }
    res.send('Пользователь удален');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;
