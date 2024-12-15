const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db'); // Базовое подключение
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Получаем пользователя по email
    const user = await db.query('SELECT * FROM Users WHERE Email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Неверные учетные данные' });
    }

    // Проверка пароля
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Неверный пароль' });
    }

    // Возвращаем роль пользователя
    res.json({ role: user.rows[0].role, message: 'Успешный вход' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;
