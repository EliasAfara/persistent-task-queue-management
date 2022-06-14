const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { pgClient, pool } = require('./db');
const lib = require('./lib');
const schedule = require('node-schedule');
const { Console } = require('console'); // get the Console class
const fs = require('fs'); // get fs module for creating write streams

const callbackRouter = require('./routes/callback');
const eventsRouter = require('./routes/events');

//middleware
app.use(cors());
app.use(express.json());

// make a new logger
const eventsLogger = new Console({
  stdout: fs.createWriteStream('logs/eventsLog.txt', {
    flags: 'a+',
  }), // a write stream (normal log outputs)
  stderr: fs.createWriteStream('logs/eventsErrorLog.txt', {
    flags: 'a+',
  }), // a write stream (error outputs)
});

pgClient.connect((err, client) => {
  if (err) {
    eventsLogger.error('Error in connecting to database', err);
  } else {
    console.log('Database Connected');

    // In case server shuts down and the events that were in procesing state stops.
    // check table events for events with procesing state at the start of the server
    // In case any were found, compare scheduled_for time with current time
    // if current time was greater, fire the event callback immediatly
    // else, calculate the remaining time and schedule it.

    lib.continueStillProcessingEvent(eventsLogger);

    // listening to event notification after a new event was created
    const query = client.query('LISTEN new_event'); // listener
    // listening to the event
    pgClient.on('notification', async (event) => {
      const payload = JSON.parse(event.payload);
      const {
        event_id,
        type,
        state,
        data,
        scheduled_for_time,
        scheduled_for,
        created_at,
        callback_id,
      } = payload;

      const callback_label = await lib.getEventCallback(callback_id);

      switch (callback_label) {
        case 'add':
          schedule.scheduleJob(scheduled_for, async function () {
            eventsLogger.log(
              JSON.stringify({
                type,
                callback: callback_label,
                created_at,
                scheduled_for,
                output: data.x + data.y,
                state: 'finished',
              })
            );

            lib.updateEventState('finished', event_id);
          });
          break;
        case 'subtract':
          schedule.scheduleJob(scheduled_for, async function () {
            eventsLogger.log(
              JSON.stringify({
                type,
                callback: callback_label,
                created_at,
                scheduled_for,
                output: data.x - data.y,
                state: 'finished',
              })
            );

            lib.updateEventState('finished', event_id);
          });
          break;
        case 'divide':
          schedule.scheduleJob(scheduled_for, async function () {
            eventsLogger.log(
              JSON.stringify({
                type,
                callback: callback_label,
                created_at,
                scheduled_for,
                output: data.x / data.y,
                state: 'finished',
              })
            );

            lib.updateEventState('finished', event_id);
          });
          break;
        case 'multiply':
          schedule.scheduleJob(scheduled_for, async function () {
            eventsLogger.log(
              JSON.stringify({
                type,
                callback: callback_label,
                created_at,
                scheduled_for,
                output: data.x * data.y,
                state: 'finished',
              })
            );

            lib.updateEventState('finished', event_id);
          });
          break;
      }
    });
  }
});

// eventEmitter.on(type, callbackObject.func);
// eventEmitter.emit(type, data.x, data.y);

// Routes
app.use('/callbacks', callbackRouter);
app.use('/events', eventsRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
