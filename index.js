const express = require('express');
const cors = require('cors');
const fs = require('fs'); // get fs module for creating write streams
const { Console } = require('console'); // get the Console class
const schedule = require('node-schedule');
require('dotenv').config();
const { pgClient } = require('./db');
const lib = require('./lib');

const app = express();

const callbackRouter = require('./routes/callback');
const eventsRouter = require('./routes/events');

// middleware
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

    lib.continueStillProcessingEvent(eventsLogger);

    // listening to event notification after a new event was created
    const query = client.query('LISTEN new_event'); // listener
    // listening to the event
    pgClient.on('notification', async (event) => {
      const payload = JSON.parse(event.payload);
      const { event_id, type, data, scheduled_for, created_at, callback_id } =
        payload;

      const callback_label = await lib.getEventCallback(callback_id);

      switch (callback_label) {
        case 'add':
          schedule.scheduleJob(scheduled_for, async function () {
            const output = data.x + data.y;

            lib.logEvent(
              eventsLogger,
              type,
              callback_label,
              created_at,
              scheduled_for,
              output
            );

            lib.updateEventState('finished', event_id);
          });
          break;
        case 'subtract':
          schedule.scheduleJob(scheduled_for, async function () {
            const output = data.x - data.y;

            lib.logEvent(
              eventsLogger,
              type,
              callback_label,
              created_at,
              scheduled_for,
              output
            );

            lib.updateEventState('finished', event_id);
          });
          break;
        case 'divide':
          schedule.scheduleJob(scheduled_for, async function () {
            const output = data.x / data.y;

            lib.logEvent(
              eventsLogger,
              type,
              callback_label,
              created_at,
              scheduled_for,
              output
            );

            lib.updateEventState('finished', event_id);
          });
          break;
        case 'multiply':
          schedule.scheduleJob(scheduled_for, async function () {
            const output = data.x * data.y;

            lib.logEvent(
              eventsLogger,
              type,
              callback_label,
              created_at,
              scheduled_for,
              output
            );

            lib.updateEventState('finished', event_id);
          });
          break;
      }
    });
  }
});

// Routes
app.use('/callbacks', callbackRouter);
app.use('/events', eventsRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
