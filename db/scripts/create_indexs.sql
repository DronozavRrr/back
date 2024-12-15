
CREATE INDEX idx_users_email ON Users (Email);
CREATE INDEX idx_wallets_userid ON Wallets (UserID);
CREATE INDEX idx_transactions_time ON Transactions (Time);
CREATE INDEX idx_marketorders_time ON MarketOrders (Time);
CREATE INDEX idx_cryptorates_time ON CryptoRates (Time);
