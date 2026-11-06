require('dotenv').config();

module.exports = {
  development: {
    client: 'pg', // Pode ser alterado para 'mysql2' ou 'sqlite3' se necessário
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: './src/migrations',
    },
  },
};