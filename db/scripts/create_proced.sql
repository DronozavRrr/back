CREATE OR REPLACE FUNCTION RegisterUser(
    p_username VARCHAR(50),
    p_password VARCHAR(50),
    p_email VARCHAR(50),
    p_role VARCHAR(10)
)
RETURNS VOID AS $$
BEGIN
    -- Проверяем уникальность Email
    IF EXISTS (SELECT 1 FROM Users WHERE Email = p_email) THEN
        RAISE EXCEPTION 'Пользователь с таким Email уже существует.';
    END IF;

    -- Вставляем нового пользователя
    INSERT INTO Users (Username, Password, Email, Role)
    VALUES (p_username, p_password, p_email, p_role);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION CreateTransaction(
    sender_wallet_id INT,
    receiver_wallet_id INT,
    transfer_amount DECIMAL(20, 8),
    transfer_fee DECIMAL(20, 8),
    status_id INT
)
RETURNS VOID AS $$
DECLARE
    sender_balance DECIMAL(20, 8);
BEGIN
    -- Получаем баланс отправителя
    SELECT Balance INTO sender_balance
    FROM Wallets
    WHERE WalletID = sender_wallet_id;

    -- Проверяем достаточность средств
    IF sender_balance < transfer_amount + transfer_fee THEN
        RAISE EXCEPTION 'Недостаточно средств для перевода.';
    END IF;

    -- Обновляем баланс отправителя
    UPDATE Wallets
    SET Balance = Balance - (transfer_amount + transfer_fee)
    WHERE WalletID = sender_wallet_id;

    -- Обновляем баланс получателя
    UPDATE Wallets
    SET Balance = Balance + transfer_amount
    WHERE WalletID = receiver_wallet_id;

    -- Добавляем запись в таблицу транзакций
    INSERT INTO Transactions (SenderWalletID, ReceiverWalletID, Amount, Fee, StatusID)
    VALUES (sender_wallet_id, receiver_wallet_id, transfer_amount, transfer_fee, status_id);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION UpdateOrderStatus(
    p_order_id INT,
    p_status_id INT
)
RETURNS VOID AS $$
BEGIN
    -- Обновляем статус ордера
    UPDATE MarketOrders
    SET StatusID = p_status_id
    WHERE OrderID = p_order_id;

    -- Добавляем запись в историю статусов
    INSERT INTO OrderHistory (OrderID, StatusID)
    VALUES (p_order_id, p_status_id);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION GetUserBalance(
    p_user_id INT
)
RETURNS TABLE (
    WalletID INT,
    CryptoName VARCHAR(50),
    Balance DECIMAL(20, 8)
) AS $$
BEGIN
    RETURN QUERY
    SELECT w.WalletID, c.Name, w.Balance
    FROM Wallets w
    JOIN Cryptocurrencies c ON w.CryptoID = c.CryptoID
    WHERE w.UserID = p_user_id;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION GetTransactionHistory(
    p_user_id INT
)
RETURNS TABLE (
    TransactionID INT,
    SenderWalletID INT,
    ReceiverWalletID INT,
    Amount DECIMAL(20, 8),
    Fee DECIMAL(20, 8),
    Status VARCHAR(50),
    TransactionTime TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.TransactionID, t.SenderWalletID, t.ReceiverWalletID, t.Amount, t.Fee, s.Name, t.TransactionTime
    FROM Transactions t
    JOIN Status s ON t.StatusID = s.StatusID
    WHERE t.SenderWalletID IN (
        SELECT WalletID FROM Wallets WHERE UserID = p_user_id
    ) OR t.ReceiverWalletID IN (
        SELECT WalletID FROM Wallets WHERE UserID = p_user_id
    )
    ORDER BY t.TransactionTime DESC;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_all_wallets()
RETURNS TABLE(WalletID INT, UserID INT, Balance DECIMAL, CryptoID INT) AS $$
BEGIN
  RETURN QUERY 
  SELECT w.WalletID, w.UserID, w.Balance, w.CryptoID 
  FROM Wallets w; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION get_wallets_by_user(p_user_id INT)
RETURNS TABLE(WalletID INT, Balance DECIMAL, CryptoID INT) AS $$
BEGIN
  RETURN QUERY 
  SELECT w.WalletID, w.Balance, w.CryptoID
  FROM Wallets w
  WHERE w.UserID = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION get_limited_wallets()
RETURNS TABLE(WalletID INT, Balance DECIMAL) AS $$
BEGIN
  RETURN QUERY 
  SELECT w.WalletID, w.Balance 
  FROM Wallets w;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


GRANT EXECUTE ON FUNCTION get_all_wallets() TO admin_role;


GRANT EXECUTE ON FUNCTION get_wallets_by_user(INT) TO user_role;


GRANT EXECUTE ON FUNCTION get_limited_wallets() TO guest_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE Transactions TO admin_role;

GRANT SELECT ON TABLE Transactions TO user_role;

REVOKE ALL ON TABLE Transactions FROM guest_role;


GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE Cryptocurrencies TO admin_role;

GRANT SELECT ON TABLE Cryptocurrencies TO user_role, guest_role;
