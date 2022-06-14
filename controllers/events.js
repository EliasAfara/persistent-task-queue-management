const { pool } = require('../db');

/**
 * @route    POST | #endpoint: /events
 * @desc     Create an event
 * @access   Public
 */
const registerEvent = async (req, res) => {
  try {
    const { type, data, scheduled_for_time } = req.body;
    let callback_label = '';

    switch (type) {
      case 'addition':
        callback_label = 'add';
        break;
      case 'subtraction':
        callback_label = 'subtract';
        break;
      case 'division':
        callback_label = 'divide';
        break;
      case 'multiplication':
        callback_label = 'multiply';
        break;
      default:
        return res.status(401).json({
          msg: 'This event is not related to any of the available callbacks',
        });
    }

    const callback = await pool.query(
      'SELECT callback_id from callback WHERE label=$1',
      [callback_label]
    );

    if (callback.rowCount !== 0) {
      let callback_id = callback.rows[0].callback_id;
      const newEvent = await pool.query(
        `INSERT INTO events (type, data, scheduled_for_time, scheduled_for, callback_id) VALUES($1, $2, $3, to_timestamp(${Date.now()} / 1000.0) + INTERVAL '${
          scheduled_for_time || '1 second'
        }' , $4) RETURNING *`,
        [type, data, scheduled_for_time || '1 second', callback_id]
      );

      res.status(200).json(newEvent.rows[0]);
    }
    // console.log(type, data, callback.rows[0].callback_id);
  } catch (err) {
    console.log(err.message);
  }
};

/**
 * @route    GET | #endpoint: /events
 * @desc     Should get the list of all available events
 * @access   Public
 */
const getEvents = async (req, res) => {
  try {
    const allEvent = await pool.query(
      'SELECT * FROM events ORDER BY event_id ASC'
    );

    res.status(200).json(allEvent.rows);
  } catch (err) {
    console.log(err.message);
  }
};

/**
 * @route    GET | #endpoint: /events/:id
 * @desc     Should get the details of a specific event
 * @access   Public
 */
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const available = await pool.query(
      'select exists(select 1 from events where event_id=$1)',
      [id]
    );

    if (!available.rows[0].exists) {
      return res.status(404).json({ msg: 'Event was not found' });
    }

    const event = await pool.query('SELECT * FROM events WHERE event_id = $1', [
      id,
    ]);

    res.status(200).json(event.rows[0]);
  } catch (err) {
    console.log(err.message);
  }
};

/**
 * @route    PUT | #endpoint: /events/:id
 * @desc     Update an existing event
 * @access   Public
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, data } = req.body;

    const isEventAvailable = await pool.query(
      'select exists(select 1 from events where event_id=$1)',
      [id]
    );

    if (!isEventAvailable.rows[0].exists) {
      return res.status(404).json({ msg: 'Event was not found' });
    }

    let callback_label = '';

    switch (type) {
      case 'addition':
        callback_label = 'add';
        break;
      case 'subtraction':
        callback_label = 'subtract';
        break;
      case 'division':
        callback_label = 'divide';
        break;
      case 'multiplication':
        callback_label = 'multiply';
        break;
      default:
        console.log(
          'This event is not related to any of the available callbacks'
        );
    }

    const callback = await pool.query(
      'SELECT callback_id from callback WHERE label=$1',
      [callback_label]
    );

    if (callback.rowCount !== 0) {
      let callback_id = callback.rows[0].callback_id;
      const updatedEvent = await pool.query(
        'UPDATE events SET type = $1, data = $2, callback_id = $3 WHERE event_id = $4',
        [type, data, callback_id, id]
      );

      res.json('Event was updated successfully');
    }
  } catch (err) {
    console.log(err.message);
  }
};

/**
 * @route    DELETE | #endpoint: /events/:id
 * @desc     Delete an existing event
 * @access   Public
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const available = await pool.query(
      'select exists(select 1 from events where event_id=$1)',
      [id]
    );

    if (!available.rows[0].exists) {
      return res.status(404).json({ msg: 'Event was not found' });
    }

    const deleteEvent = await pool.query(
      'DELETE FROM events WHERE event_id = $1',
      [id]
    );

    res.json('Event was deleted successfully');
  } catch (err) {
    console.log(err.message);
  }
};

// export controller functions
module.exports = {
  registerEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
