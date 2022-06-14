const pool = require('../db');

/**
 * @route    POST | #endpoint: /callbacks
 * @desc     Create a callback
 * @access   Public
 */
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

/**
 * @route    GET | #endpoint: /callbacks
 * @desc     Should get the list of all available callbacks
 * @access   Public
 */
const getCallbacks = async (req, res) => {
  try {
    const allCallbacks = await pool.query('SELECT * FROM callback');

    res.status(200).json(allCallbacks.rows);
  } catch (err) {
    console.log(err.message);
  }
};

/**
 * @route    GET | #endpoint: /callbacks/:id
 * @desc     Should get the details of a specific callback
 * @access   Public
 */
const getCallbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const available = await pool.query(
      'select exists(select 1 from callback where callback_id=$1)',
      [id]
    );

    if (!available.rows[0].exists) {
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

/**
 * @route    PUT | #endpoint: /callbacks/:id
 * @desc     Update an existing callback
 * @access   Public
 */
const updateCallback = async (req, res) => {
  try {
    const { id } = req.params;
    const { label } = req.body;

    const available = await pool.query(
      'select exists(select 1 from callback where callback_id=$1)',
      [id]
    );

    if (!available.rows[0].exists) {
      return res.status(404).json({ msg: 'callback was not found' });
    }

    const updatedCallback = await pool.query(
      'UPDATE callback SET label = $1 WHERE callback_id = $2',
      [label, id]
    );

    res.json('Callback was updated successfully');
  } catch (err) {
    console.log(err.message);
  }
};

/**
 * @route    DELETE | #endpoint: /callbacks/:id
 * @desc     Delete an existing callback
 * @access   Public
 */
const deleteCallback = async (req, res) => {
  try {
    const { id } = req.params;

    const available = await pool.query(
      'select exists(select 1 from callback where callback_id=$1)',
      [id]
    );

    if (!available.rows[0].exists) {
      return res.status(404).json({ msg: 'callback was not found' });
    }

    const deleteCallback = await pool.query(
      'DELETE FROM callback WHERE callback_id = $1',
      [id]
    );

    res.json('Callback was deleted successfully');
  } catch (err) {
    console.log(err.message);
  }
};

// export controller functions
module.exports = {
  registerCallback,
  getCallbacks,
  getCallbackById,
  updateCallback,
  deleteCallback,
};
