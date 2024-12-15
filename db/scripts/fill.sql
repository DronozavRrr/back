-- Вставка тестовых данных

-- Таблица статусов
INSERT INTO Status (Name, Description) 
VALUES 
    ('Open', 'Открыто'),
    ('Completed', 'Завершено'),
    ('Cancelled', 'Отменено'),
    ('Pending', 'В ожидании');

-- Таблица пользователей
INSERT INTO Users (Username, Password, Email, Role)
VALUES
    ('admin', 'adminpass', 'admin@example.com', 'Admin'),
    ('user1', 'password1', 'user1@example.com', 'User'),
    ('guest1', 'password2', 'guest1@example.com', 'Guest');

-- Таблица криптовалют
INSERT INTO Cryptocurrencies (Name, Symbol, MarketCap)
VALUES
    ('Bitcoin', 'BTC', 500000000000),
    ('Ethereum', 'ETH', 200000000000),
    ('Litecoin', 'LTC', 10000000000);

-- Таблица кошельков
INSERT INTO Wallets (UserID, CryptoID, Balance)
VALUES
    (2, 1, 1.5),  -- У пользователя user1 есть 1.5 BTC
    (2, 2, 10),   -- У пользователя user1 есть 10 ETH
    (3, 1, 0.1);  -- У гостя есть 0.1 BTC

-- Таблица транзакций
INSERT INTO Transactions (SenderWalletID, ReceiverWalletID, Amount, Fee, StatusID)
VALUES
    (1, 2, 0.5, 0.01, 1); -- Транзакция на 0.5 BTC с комиссией 0.01 BTC

-- Таблица рыночных ордеров
-- Порядок вставки должен быть перед таблицей OrderHistory
INSERT INTO MarketOrders (UserID, CryptoID, Type, Amount, Price, StatusID)
VALUES
    (2, 1, 'Buy', 0.5, 30000, 1), -- Покупка 0.5 BTC по цене 30000
    (2, 2, 'Sell', 5, 2000, 1);   -- Продажа 5 ETH по цене 2000

-- Таблица истории ордеров
-- Убедитесь, что OrderID существует в MarketOrders
INSERT INTO OrderHistory (OrderID, StatusID)
VALUES
    (1, 1), -- Ордер "Открыт"
    (2, 1); -- Ордер "Открыт"

-- Таблица курсов криптовалют
INSERT INTO CryptoRates (CryptoID, Rate)
VALUES
    (1, 30000),  -- Курс Bitcoin = 30000
    (2, 2000),   -- Курс Ethereum = 2000
    (3, 100);    -- Курс Litecoin = 100
