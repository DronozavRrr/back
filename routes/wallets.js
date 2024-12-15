const express = require('express');
const db = require('../db');
const router = express.Router();
const getDBConnection = require('../db/connection');
// 1. Получение всех кошельков пользователя
router.get('/', async (req, res) => {
  const { role } = req.query; // Роль передается через query параметр

  if (!role) {
    return res.status(400).json({ message: 'Укажите роль пользователя' });
  }

  try {
    const db = getDBConnection(role); // Устанавливаем соединение на основе роли
    const result = await db.query('SELECT * FROM Wallets'); // Запрос к таблице Wallets

    res.json(result.rows); // Возвращаем результат
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера или доступа к таблице');
  }
});

// 2. Получение баланса конкретного кошелька
router.get('/:walletID/balance', async (req, res) => {
  const { walletID } = req.params;
  try {
    const result = await db.query('SELECT Balance FROM Wallets WHERE WalletID = $1', [walletID]);
    if (result.rows.length === 0) {
      return res.status(404).send('Кошелек не найден');
    }
    res.json({ walletID, balance: result.rows[0].balance });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка при получении баланса');
  }
});

// 3. Создание нового кошелька
router.post('/', async (req, res) => {
  const { userid, cryptoid, balance } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO Wallets (UserID, CryptoID, Balance) VALUES ($1, $2, $3) RETURNING *',
      [userid, cryptoid, balance]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка при создании кошелька');
  }
});

// 4. Обновление баланса кошелька
router.put('/:walletid', async (req, res) => {
  const { walletid } = req.params;
  const { cryptoid, balance, userid } = req.body;
  try {
    const result = await db.query(
      'UPDATE Wallets SET CryptoID = $1, Balance = $2, UserID = $3 WHERE WalletID = $4 RETURNING *',
      [cryptoid, balance, userid, walletid]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Кошелек не найден');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка при обновлении кошелька');
  }
});

// 5. Удаление кошелька
router.delete('/:walletid', async (req, res) => {
  const { walletid } = req.params;
  try {
    const result = await db.query('DELETE FROM Wallets WHERE WalletID = $1 RETURNING *', [walletid]);
    if (result.rowCount === 0) {
      return res.status(404).send('Кошелек не найден');
    }
    res.send('Кошелек удален');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка при удалении кошелька');
  }
});

// 6. Перевод средств между кошельками (с использованием транзакции)
router.post('/transfer', async (req, res) => {
  const { senderWalletID, receiverWalletID, amount } = req.body;

  try {
    await db.query('BEGIN');

    // Получаем баланс отправителя
    const senderResult = await db.query('SELECT Balance FROM Wallets WHERE WalletID = $1', [senderWalletID]);
    if (senderResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).send('Кошелек отправителя не найден');
    }

    const senderBalance = parseFloat(senderResult.rows[0].balance);
    if (senderBalance < amount) {
      await db.query('ROLLBACK');
      return res.status(400).send('Недостаточно средств на кошельке отправителя');
    }

    // Обновляем баланс отправителя
    await db.query('UPDATE Wallets SET Balance = Balance - $1 WHERE WalletID = $2', [amount, senderWalletID]);

    // Обновляем баланс получателя
    await db.query('UPDATE Wallets SET Balance = Balance + $1 WHERE WalletID = $2', [amount, receiverWalletID]);

    await db.query('COMMIT');
    res.send('Перевод средств выполнен успешно');
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Ошибка при выполнении перевода средств');
  }
});

module.exports = router;
