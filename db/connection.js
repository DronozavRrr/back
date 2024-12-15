const { Pool } = require('pg');
require('dotenv').config();

const getDBConnection = (role) => {
  let user, password;

  switch (role) {
    case 'Admin':
      user = process.env.DB_ADMIN_USER;
      password = process.env.DB_ADMIN_PASSWORD;
      break;
    case 'User':
      user = process.env.DB_USER_USER;
      password = process.env.DB_USER_PASSWORD;
      break;
    case 'Guest':
      user = process.env.DB_GUEST_USER;
      password = process.env.DB_GUEST_PASSWORD;
      break;
    default:
      throw new Error('Недопустимая роль пользователя');
  }

  return new Pool({
    user,
    password,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });
};

module.exports = getDBConnection;
