const { pool } = require('./db');
const schedule = require('node-schedule');

const getEventCallback = async (callback_id) => {
  const callback_func = await pool.query(
    'SELECT label FROM callback WHERE callback_id = $1',
    [callback_id]
  );

  return callback_func.rows[0].label;
};

const continueStillProcessingEvent = async (eventsLogger) => {
  const events = await pool.query(
    'SELECT * FROM events inner join callback on events.callback_id = callback.callback_id and state=$1',
    ['processing']
  );

  // console.log(events.rows);

  for (oldEvent of events.rows) {
    const { event_id, type, label, created_at, scheduled_for, data } = oldEvent;

    const presentDate = new Date();
    const scheduledForDate = new Date(scheduled_for);

    if (presentDate > scheduledForDate) {
      switch (label) {
        case 'add':
          eventsLogger.log(
            JSON.stringify({
              type,
              callback: label,
              created_at,
              scheduled_for,
              output: data.x + data.y,
              state: 'finished',
            })
          );
          updateEventState('finished', event_id);
          break;
        case 'subtract':
          eventsLogger.log(
            JSON.stringify({
              type,
              callback: label,
              created_at,
              scheduled_for,
              output: data.x - data.y,
              state: 'finished',
            })
          );
          updateEventState('finished', event_id);
          break;
        case 'divide':
          eventsLogger.log(
            JSON.stringify({
              type,
              callback: label,
              created_at,
              scheduled_for,
              output: data.x / data.y,
              state: 'finished',
            })
          );
          updateEventState('finished', event_id);
          break;
        case 'multiply':
          eventsLogger.log(
            JSON.stringify({
              type,
              callback: label,
              created_at,
              scheduled_for,
              output: data.x * data.y,
              state: 'finished',
            })
          );
          updateEventState('finished', event_id);
          break;
      }
    } else {
      switch (label) {
        case 'add':
          schedule.scheduleJob(scheduled_for, async function () {
            eventsLogger.log(
              JSON.stringify({
                type,
                callback: label,
                created_at,
                scheduled_for,
                output: data.x + data.y,
                state: 'finished',
              })
            );

            updateEventState('finished', event_id);
          });
          break;
        case 'subtract':
          schedule.scheduleJob(scheduled_for, async function () {
            eventsLogger.log(
              JSON.stringify({
                type,
                callback: label,
                created_at,
                scheduled_for,
                output: data.x - data.y,
                state: 'finished',
              })
            );

            updateEventState('finished', event_id);
          });
          break;
        case 'divide':
          schedule.scheduleJob(scheduled_for, async function () {
            eventsLogger.log(
              JSON.stringify({
                type,
                callback: label,
                created_at,
                scheduled_for,
                output: data.x / data.y,
                state: 'finished',
              })
            );

            updateEventState('finished', event_id);
          });
          break;
        case 'multiply':
          schedule.scheduleJob(scheduled_for, async function () {
            eventsLogger.log(
              JSON.stringify({
                type,
                callback: label,
                created_at,
                scheduled_for,
                output: data.x * data.y,
                state: 'finished',
              })
            );

            updateEventState('finished', event_id);
          });
          break;
      }
    }
  }
};

// function to update event state to "finished"
// Create a server-sent event

const updateEventState = async (state, event_id) => {
  const updateQuery = 'UPDATE events SET state = $1 WHERE event_id = $2';
  await pool.query(updateQuery, [state, event_id]);
};

module.exports = {
  getEventCallback,
  continueStillProcessingEvent,
  updateEventState,
};
