const Pool = require('pg').Pool;

const pool = new Pool({
  user: '<username>',
  password: '<password>',
  host: 'localhost',
  port: 5432,
  database: 'ral_tasks_queue',
});

module.exports = pool;
