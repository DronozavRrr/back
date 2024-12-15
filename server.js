const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();


app.use(cors());
app.use(bodyParser.json());

const userRoutes = require('./routes/users');
const walletRoutes = require('./routes/wallets');
const transactionRoutes = require('./routes/transactions');
const orderRoutes = require('./routes/orders');
const statusRoutes = require('./routes/statuses');
const cryptoRoutes = require('./routes/cryptocurrencies');
const orderHistoryRoutes = require('./routes/orderHistory');
const cryptoRatesRoutes = require('./routes/cryptoRates');
const authRoutes = require('./routes/auth');
const errorRoutes = require('./routes/errorLogs');

app.use('/api/users', userRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/cryptocurrencies', cryptoRoutes);
app.use('/api/orderhistory', orderHistoryRoutes);
app.use('/api/cryptorates', cryptoRatesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/errorLogs',errorRoutes)




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
