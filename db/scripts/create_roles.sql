
CREATE ROLE admin_role LOGIN PASSWORD 'admin_password';
CREATE ROLE user_role LOGIN PASSWORD 'user_password';
CREATE ROLE guest_role LOGIN PASSWORD 'guest_password';


GRANT ALL PRIVILEGES ON DATABASE CryptoExchange TO admin_role;


GRANT CONNECT ON DATABASE CryptoExchange TO user_role;
GRANT USAGE ON SCHEMA public TO user_role;

GRANT SELECT, INSERT, UPDATE ON TABLE Users TO user_role;
GRANT SELECT, INSERT, UPDATE ON TABLE Wallets TO user_role;
GRANT SELECT ON TABLE Cryptocurrencies TO user_role;


GRANT CONNECT ON DATABASE CryptoExchange TO guest_role;
GRANT USAGE ON SCHEMA public TO guest_role;

GRANT SELECT ON TABLE Cryptocurrencies TO guest_role;
GRANT SELECT ON TABLE CryptoRates TO guest_role;
