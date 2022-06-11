const pg = require('pg');
const Pool = pg.Pool;

const pool = new Pool({
  user: 'newuserelias',
  password: 'Lesio1970',
  host: 'localhost',
  port: 5432,
  database: 'ral_tasks_queue',
});

const connectionString =
  'postgres://newuserelias:Lesio1970@localhost:5432/ral_tasks_queue';

const pgClient = new pg.Client(connectionString);

module.exports = { pool, pgClient };
