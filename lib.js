const { pool } = require('./db');

function add(x, y) {
  console.log(x + y);
}

function subtract(x, y) {
  console.log(x - y);
}

function divide(x, y) {
  console.log(x / y);
}

function multiply(x, y) {
  console.log(x * y);
}

const getEventCallback = async (callback_id) => {
  const callback_func = await pool.query(
    'SELECT label FROM callback WHERE callback_id = $1',
    [callback_id]
  );

  return callback_func.rows[0].label;
};

module.exports = { add, subtract, divide, multiply, getEventCallback };
