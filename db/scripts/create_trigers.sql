CREATE OR REPLACE FUNCTION UpdateBalanceAfterTransaction()
RETURNS TRIGGER AS $$
BEGIN

    UPDATE Wallets
    SET Balance = Balance - (NEW.Amount + NEW.Fee)
    WHERE WalletID = NEW.SenderWalletID;


    UPDATE Wallets
    SET Balance = Balance + NEW.Amount
    WHERE WalletID = NEW.ReceiverWalletID;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER AfterTransactionInsert
AFTER INSERT ON Transactions
FOR EACH ROW
EXECUTE FUNCTION UpdateBalanceAfterTransaction();


CREATE OR REPLACE FUNCTION LogOrderStatusChange()
RETURNS TRIGGER AS $$
BEGIN

    INSERT INTO OrderHistory (OrderID, StatusID, ChangeTime)
    VALUES (NEW.OrderID, NEW.StatusID, CURRENT_TIMESTAMP);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER AfterOrderStatusUpdate
AFTER UPDATE OF StatusID ON MarketOrders
FOR EACH ROW
WHEN (OLD.StatusID IS DISTINCT FROM NEW.StatusID)
EXECUTE FUNCTION LogOrderStatusChange();


CREATE OR REPLACE FUNCTION PreventNegativeBalance()
RETURNS TRIGGER AS $$
BEGIN

    IF (SELECT Balance FROM Wallets WHERE WalletID = NEW.SenderWalletID) < (NEW.Amount + NEW.Fee) THEN
        RAISE EXCEPTION 'Недостаточно средств на кошельке для выполнения транзакции.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER BeforeTransactionInsert
BEFORE INSERT ON Transactions
FOR EACH ROW
EXECUTE FUNCTION PreventNegativeBalance();


CREATE OR REPLACE FUNCTION UpdateMarketCap()
RETURNS TRIGGER AS $$
BEGIN

    UPDATE Cryptocurrencies
    SET MarketCap = MarketCap + (NEW.Rate * 1000)  
    WHERE CryptoID = NEW.CryptoID;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER AfterCryptoRateUpdate
AFTER INSERT OR UPDATE ON CryptoRates
FOR EACH ROW
EXECUTE FUNCTION UpdateMarketCap();


CREATE TABLE ErrorLogs (
    ErrorID SERIAL PRIMARY KEY,
    Message TEXT NOT NULL,
    LogTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE OR REPLACE FUNCTION LogError()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO ErrorLogs (Message)
    VALUES (TG_ARGV[0]);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER LogTransactionError
AFTER INSERT ON Transactions
FOR EACH ROW
WHEN (NEW.Amount <= 0)
EXECUTE FUNCTION LogError('Недопустимая сумма транзакции.');

CREATE OR REPLACE FUNCTION CheckPositiveBalance()
RETURNS TRIGGER AS $$
BEGIN

    IF NEW.Balance < 0 THEN

        INSERT INTO ErrorLogs (Message)
        VALUES ('Попытка создать запись с отрицательным балансом. ПользовательID: ' || NEW.UserID);


        RAISE EXCEPTION 'Баланс не может быть отрицательным.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER CheckBalanceBeforeInsertOrUpdate
BEFORE INSERT OR UPDATE ON Wallets
FOR EACH ROW
EXECUTE FUNCTION CheckPositiveBalance();

