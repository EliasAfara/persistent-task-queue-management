const { pool } = require('../db');

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

const getEvent = async (req, res) => {
  try {
    const allEvent = await pool.query('SELECT * FROM events');

    res.status(200).json(allEvent.rows);
  } catch (err) {
    console.log(err.message);
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const availble = await pool.query(
      'select exists(select 1 from events where event_id=$1)',
      [id]
    );

    if (!availble.rows[0].exists) {
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

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, data } = req.body;

    const isEventAvailble = await pool.query(
      'select exists(select 1 from events where event_id=$1)',
      [id]
    );

    if (!isEventAvailble.rows[0].exists) {
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

      res.json('Event was updated successfuly');
    }
  } catch (err) {
    console.log(err.message);
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const availble = await pool.query(
      'select exists(select 1 from events where event_id=$1)',
      [id]
    );

    if (!availble.rows[0].exists) {
      return res.status(404).json({ msg: 'Event was not found' });
    }

    const deleteEvent = await pool.query(
      'DELETE FROM events WHERE event_id = $1',
      [id]
    );

    res.json('Event was deleted successfuly');
  } catch (err) {
    console.log(err.message);
  }
};

exports.registerEvent = registerEvent;
exports.getEvent = getEvent;
exports.getEventById = getEventById;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
