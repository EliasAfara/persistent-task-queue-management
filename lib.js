const { pool } = require('./db');
const schedule = require('node-schedule');

/**
 * @name getEventCallback
 * @description Fetches callback data according to provided `callback_id`
 * @param {Number} callback_id id of the callback to be fetched
 *
 * @returns {String} callback label
 */
const getEventCallback = async (callback_id) => {
  const callback_func = await pool.query(
    'SELECT label FROM callback WHERE callback_id = $1',
    [callback_id]
  );

  return callback_func.rows[0].label;
};

/**
 * @name continueStillProcessingEvent
 * @description At the start of the server, it checks the database events table for events in the 'processing' state, and if any are found, it calculates whether the event should be executed immediately or rescheduled.
 * @param {Console} eventsLogger Logger console
 */
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
            const output = data.x + data.y;

            lib.logEvent(
              eventsLogger,
              type,
              label,
              created_at,
              scheduled_for,
              output
            );

            updateEventState('finished', event_id);
          });
          break;
        case 'subtract':
          schedule.scheduleJob(scheduled_for, async function () {
            const output = data.x - data.y;

            lib.logEvent(
              eventsLogger,
              type,
              label,
              created_at,
              scheduled_for,
              output
            );

            updateEventState('finished', event_id);
          });
          break;
        case 'divide':
          schedule.scheduleJob(scheduled_for, async function () {
            const output = data.x / data.y;

            lib.logEvent(
              eventsLogger,
              type,
              label,
              created_at,
              scheduled_for,
              output
            );

            updateEventState('finished', event_id);
          });
          break;
        case 'multiply':
          schedule.scheduleJob(scheduled_for, async function () {
            const output = data.x * data.y;

            lib.logEvent(
              eventsLogger,
              type,
              label,
              created_at,
              scheduled_for,
              output
            );

            updateEventState('finished', event_id);
          });
          break;
      }
    }
  }
};

/**
 * @name updateEventState
 * @description Update event state in database according to `event_id`
 * @param {String} state new state of the event to be updated
 * @param {Number} event_id id of the event to be updated
 */
const updateEventState = async (state, event_id) => {
  const updateQuery = 'UPDATE events SET state = $1 WHERE event_id = $2';
  await pool.query(updateQuery, [state, event_id]);
};

/**
 * @name logEvent
 * @description Logs event object in string format to `logs.eventsLog.txt` file
 * @param {Console} eventsLogger Logger console
 * @param {String} type type of the callback
 * @param {String} label event label
 * @param {String} created_at time event created at
 * @param {String} scheduled_for time event supposed to execute at
 * @param {Number} output result of the executed callback
 */

const logEvent = (
  eventsLogger,
  type,
  label,
  created_at,
  scheduled_for,
  output
) => {
  eventsLogger.log(
    JSON.stringify({
      type,
      callback: label,
      created_at,
      scheduled_for,
      output,
      state: 'finished',
    })
  );
};

module.exports = {
  getEventCallback,
  continueStillProcessingEvent,
  updateEventState,
  logEvent,
};
