const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: Number(process.env.DB_MAX_CONNECT),
  idleTimeoutMillis: Number(process.env.DB_IDLETIMEOUT),
  connectionTimeoutMillis: Number(process.env.DB_CONNECTIONTIMEOUT),
});

module.exports = {
  pool,
};
