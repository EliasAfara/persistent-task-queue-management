const { pool } = require('./db');
const schedule = require('node-schedule');

const getEventCallback = async (callback_id) => {
  const callback_func = await pool.query(
    'SELECT label FROM callback WHERE callback_id = $1',
    [callback_id]
  );

  return callback_func.rows[0].label;
};

const continueStillProcessingEvent = async () => {
  const events = await pool.query(
    'SELECT * FROM events inner join callback on events.callback_id = callback.callback_id and state=$1',
    ['processing']
  );

  // console.log(events.rows);

  for (oldEvent of events.rows) {
    const { event_id, label, scheduled_for, data } = oldEvent;
    const updateQuery = 'UPDATE events SET state = $1 WHERE event_id = $2';

    const presentDate = new Date();
    const scheduledForDate = new Date(scheduled_for);

    if (presentDate > scheduledForDate) {
      switch (label) {
        case 'add':
          console.log('add', data.x + data.y);
          await pool.query(updateQuery, ['finished', event_id]);
          break;
        case 'subtract':
          console.log('subtract', data.x - data.y);
          await pool.query(updateQuery, ['finished', event_id]);
          break;
        case 'divide':
          console.log('divide', data.x / data.y);
          await pool.query(updateQuery, ['finished', event_id]);
          break;
        case 'multiply':
          console.log('multiply', data.x * data.y);
          await pool.query(updateQuery, ['finished', event_id]);
          break;
      }
    } else {
      switch (label) {
        case 'add':
          schedule.scheduleJob(scheduled_for, async function () {
            console.log('add', data.x + data.y);

            await pool.query(updateQuery, ['finished', event_id]);
          });
          break;
        case 'subtract':
          schedule.scheduleJob(scheduled_for, async function () {
            console.log('subtract', data.x - data.y);

            await pool.query(updateQuery, ['finished', event_id]);
          });
          break;
        case 'divide':
          schedule.scheduleJob(scheduled_for, async function () {
            console.log('divide', data.x / data.y);

            await pool.query(updateQuery, ['finished', event_id]);
          });
          break;
        case 'multiply':
          schedule.scheduleJob(scheduled_for, async function () {
            console.log('multiply', data.x * data.y);

            await pool.query(updateQuery, ['finished', event_id]);
          });
          break;
      }
    }
  }
};

module.exports = {
  getEventCallback,
  continueStillProcessingEvent,
};
