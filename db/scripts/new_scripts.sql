CREATE OR REPLACE FUNCTION GetUsersByRole(role_name TEXT)
RETURNS TABLE(userid INT, username TEXT, email TEXT, role TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT UserID, UserName, Email, Role
    FROM Users
    WHERE Role = role_name;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION CreateWallet(user_id INT, crypto_id INT, initial_balance NUMERIC)
RETURNS VOID AS $$
BEGIN
    IF initial_balance < 0 THEN
        RAISE EXCEPTION 'Начальный баланс не может быть отрицательным.';
    END IF;

    INSERT INTO Wallets (UserID, CryptoID, Balance)
    VALUES (user_id, crypto_id, initial_balance);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION UpdateCryptoRate(crypto_id INT, new_rate NUMERIC)
RETURNS VOID AS $$
BEGIN
    UPDATE CryptoRates
    SET Rate = new_rate, Time = NOW()
    WHERE CryptoID = crypto_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Криптовалюта с ID % не найдена.', crypto_id;
    END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION CreateTransaction(sender_wallet INT, receiver_wallet INT, amount NUMERIC, fee NUMERIC)
RETURNS VOID AS $$
BEGIN
    IF amount <= 0 THEN
        RAISE EXCEPTION 'Сумма транзакции должна быть положительной.';
    END IF;

    UPDATE Wallets
    SET Balance = Balance - (amount + fee)
    WHERE WalletID = sender_wallet;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Кошелек отправителя не найден.';
    END IF;

    UPDATE Wallets
    SET Balance = Balance + amount
    WHERE WalletID = receiver_wallet;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Кошелек получателя не найден.';
    END IF;

    INSERT INTO Transactions (SenderWalletID, ReceiverWalletID, Amount, Fee, StatusID, Time)
    VALUES (sender_wallet, receiver_wallet, amount, fee, 1, NOW());
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION GetTransactionHistory(user_id INT)
RETURNS TABLE(transactionid INT, sender_wallet INT, receiver_wallet INT, amount NUMERIC, fee NUMERIC, time TIMESTAMP) AS $$
BEGIN
    RETURN QUERY
    SELECT t.TransactionID, t.SenderWalletID, t.ReceiverWalletID, t.Amount, t.Fee, t.Time
    FROM Transactions t
    JOIN Wallets w ON t.SenderWalletID = w.WalletID OR t.ReceiverWalletID = w.WalletID
    WHERE w.UserID = user_id;
END;
$$ LANGUAGE plpgsql;
