const pool = require('../db');

const registerCallback = async (req, res) => {
  try {
    const { label } = req.body;
    const newCallback = await pool.query(
      'INSERT INTO callback (label) VALUES($1) RETURNING *',
      [label]
    );

    res.status(200).json(newCallback.rows[0]);
  } catch (err) {
    console.log(err.message);
  }
};

const getCallbacks = async (req, res) => {
  try {
    const allCallbacks = await pool.query('SELECT * FROM callback');

    res.status(200).json(allCallbacks.rows);
  } catch (err) {
    console.log(err.message);
  }
};

const getCallbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const availble = await pool.query(
      'select exists(select 1 from callback where callback_id=$1)',
      [id]
    );

    if (!availble.rows[0].exists) {
      return res.status(404).json({ msg: 'callback was not found' });
    }

    const callback = await pool.query(
      'SELECT * FROM callback WHERE callback_id = $1',
      [id]
    );

    res.status(200).json(callback.rows[0]);
  } catch (err) {
    console.log(err.message);
  }
};

const updateCallback = async (req, res) => {
  try {
    const { id } = req.params;
    const { label } = req.body;

    const availble = await pool.query(
      'select exists(select 1 from callback where callback_id=$1)',
      [id]
    );

    if (!availble.rows[0].exists) {
      return res.status(404).json({ msg: 'callback was not found' });
    }

    const updatedCallback = await pool.query(
      'UPDATE callback SET label = $1 WHERE callback_id = $2',
      [label, id]
    );

    res.json('Callback was updated successfuly');
  } catch (err) {
    console.log(err.message);
  }
};

const deleteCallback = async (req, res) => {
  try {
    const { id } = req.params;

    const availble = await pool.query(
      'select exists(select 1 from callback where callback_id=$1)',
      [id]
    );

    if (!availble.rows[0].exists) {
      return res.status(404).json({ msg: 'callback was not found' });
    }

    const deleteCallback = await pool.query(
      'DELETE FROM callback WHERE callback_id = $1',
      [id]
    );

    res.json('Callback was deleted successfuly');
  } catch (err) {
    console.log(err.message);
  }
};

exports.registerCallback = registerCallback;
exports.getCallbacks = getCallbacks;
exports.getCallbackById = getCallbackById;
exports.updateCallback = updateCallback;
exports.deleteCallback = deleteCallback;
