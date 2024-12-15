const express = require('express');
const db = require('../db'); // Импорт файла db/index.js
const getDBConnection = require('../db/connection');
const router = express.Router();

// Получение всех транзакций
router.get('/', async (req, res) => {
  const { role } = req.query; // Роль передается через query параметр

  if (!role) {
    return res.status(400).json({ message: 'Укажите роль пользователя' });
  }

  try {
    const db = getDBConnection(role); // Подключение на основе роли
    const result = await db.query(`
      SELECT t.TransactionID, t.SenderWalletID, t.ReceiverWalletID, 
             t.Amount, t.Fee, s.Name AS StatusName, t."time"
      FROM Transactions t
      JOIN Status s ON t.StatusID = s.StatusID
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении транзакций:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});



// Получение транзакции по ID
router.get('/:id', async (req, res) => {
  const { role } = req.query;
  const { id } = req.params;

  if (!role) {
    return res.status(400).json({ message: 'Укажите роль пользователя' });
  }

  try {
    const db = getDBConnection(role);
    const result = await db.query(`
      SELECT t.TransactionID, t.SenderWalletID, t.ReceiverWalletID, 
             t.Amount, t.Fee, s.Name AS StatusName, t."time"
      FROM Transactions t
      JOIN Status s ON t.StatusID = s.StatusID
      WHERE t.TransactionID = $1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Транзакция не найдена');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при получении транзакции:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Создание новой транзакции
router.post('/', async (req, res) => {
  const { senderWalletID, receiverWalletID, amount, fee, statusID } = req.body;
  const { role } = req.query;



  try {
    await db.query(
      'SELECT CreateTransaction($1, $2, $3, $4, $5)',
      [senderWalletID, receiverWalletID, amount, fee, statusID]
    );
    res.status(201).json({ message: 'Транзакция успешно создана' });
  } catch (err) {
    console.error('Ошибка при создании транзакции:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { role } = req.query;



  try {
    const result = await db.query('DELETE FROM Transactions WHERE TransactionID = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send('Транзакция не найдена');
    }
    res.send('Транзакция удалена');
  } catch (err) {
    console.error('Ошибка при удалении транзакции:', err.message);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;
