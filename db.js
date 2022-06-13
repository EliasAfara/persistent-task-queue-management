const pg = require('pg');
const Pool = pg.Pool;
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

const connectionString = process.env.PG_CONNECTION_STRING;

const pgClient = new pg.Client(connectionString);

module.exports = { pool, pgClient };
