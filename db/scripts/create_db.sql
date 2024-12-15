
CREATE DATABASE CryptoExchange;


\c cryptoexchange

CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(50) NOT NULL,
    Email VARCHAR(50) NOT NULL UNIQUE,
    Role VARCHAR(10) NOT NULL CHECK (Role IN ('Admin', 'User', 'Guest'))
);


CREATE TABLE Cryptocurrencies (
    CryptoID SERIAL PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    Symbol VARCHAR(10) NOT NULL UNIQUE,
    MarketCap DECIMAL(20, 2) NOT NULL
);


CREATE TABLE Wallets (
    WalletID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    CryptoID INT NOT NULL,
    Balance DECIMAL(20, 8) NOT NULL DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (CryptoID) REFERENCES Cryptocurrencies(CryptoID) ON DELETE CASCADE
);


CREATE TABLE Status (
    StatusID SERIAL PRIMARY KEY,
    Name VARCHAR(50) NOT NULL UNIQUE,
    Description VARCHAR(250)
);


CREATE TABLE Transactions (
    TransactionID SERIAL PRIMARY KEY,
    SenderWalletID INT NOT NULL,
    ReceiverWalletID INT NOT NULL,
    Amount DECIMAL(20, 8) NOT NULL,
    Fee DECIMAL(20, 8) NOT NULL,
    StatusID INT NOT NULL,
    Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (SenderWalletID) REFERENCES Wallets(WalletID) ON DELETE CASCADE,
    FOREIGN KEY (ReceiverWalletID) REFERENCES Wallets(WalletID) ON DELETE CASCADE,
    FOREIGN KEY (StatusID) REFERENCES Status(StatusID)
);


CREATE TABLE MarketOrders (
    OrderID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    CryptoID INT NOT NULL,
    Type VARCHAR(10) NOT NULL CHECK (Type IN ('Buy', 'Sell')),
    Amount DECIMAL(20, 8) NOT NULL,
    Price DECIMAL(20, 8) NOT NULL,
    StatusID INT NOT NULL,
    Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (CryptoID) REFERENCES Cryptocurrencies(CryptoID) ON DELETE CASCADE,
    FOREIGN KEY (StatusID) REFERENCES Status(StatusID)
);


CREATE TABLE OrderHistory (
    HistoryID SERIAL PRIMARY KEY,
    OrderID INT NOT NULL,
    StatusID INT NOT NULL,
    Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES MarketOrders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (StatusID) REFERENCES Status(StatusID)
);


CREATE TABLE CryptoRates (
    RateID SERIAL PRIMARY KEY,
    CryptoID INT NOT NULL,
    Rate DECIMAL(20, 8) NOT NULL,
    Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CryptoID) REFERENCES Cryptocurrencies(CryptoID) ON DELETE CASCADE
);
