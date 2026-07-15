const { Pool } = require('pg');
const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_MAX_CONNECT,
  DB_IDLETIMEOUT,
  DB_CONNECTIONTIMEOUT,
  DATABASE_URL,
} = require('./envs');

const dbConnectionLocal = {
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  max: Number(DB_MAX_CONNECT),
  idleTimeoutMillis: Number(DB_IDLETIMEOUT),
  connectionTimeoutMillis: Number(DB_CONNECTIONTIMEOUT),
};

const dbConnectionProduction = {
  connectionString: DATABASE_URL,
};

const pool = new Pool(DATABASE_URL ? dbConnectionProduction : dbConnectionLocal);

module.exports = {
  pool,
};
