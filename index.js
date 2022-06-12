const express = require('express');
const app = express();
const cors = require('cors');
const { pgClient, pool } = require('./db');
const lib = require('./lib');
const schedule = require('node-schedule');

const callbackRouter = require('./routes/callback');
const eventsRouter = require('./routes/events');

//middleware
app.use(cors());
app.use(express.json());

pgClient.connect((err, client) => {
  if (err) {
    console.error('Error in connecting to database', err);
  } else {
    console.log('Database Connected');
    const query = client.query('LISTEN new_event');
    pgClient.on('notification', async (event) => {
      const payload = JSON.parse(event.payload);
      // console.log('row added', payload);
      const { data, event_id, callback_id, scheduled_for } = payload;
      const callback_label = await lib.getEventCallback(callback_id);

      const updateQuery = 'UPDATE events SET state = $1 WHERE event_id = $2';

      switch (callback_label) {
        case 'add':
          schedule.scheduleJob(scheduled_for, async function () {
            console.log('add', data.x + data.y);

            const updatedEvent = await pool.query(updateQuery, [
              'finished',
              event_id,
            ]);
          });
          break;
        case 'subtract':
          schedule.scheduleJob(scheduled_for, async function () {
            console.log('subtract', data.x - data.y);

            const updatedEvent = await pool.query(updateQuery, [
              'finished',
              event_id,
            ]);
          });
          break;
        case 'divide':
          schedule.scheduleJob(scheduled_for, async function () {
            console.log('divide', data.x / data.y);

            const updatedEvent = await pool.query(updateQuery, [
              'finished',
              event_id,
            ]);
          });
          break;
        case 'multiply':
          schedule.scheduleJob(scheduled_for, async function () {
            console.log('multiply', data.x * data.y);

            const updatedEvent = await pool.query(updateQuery, [
              'finished',
              event_id,
            ]);
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

app.listen('3001', () => {
  console.log('server running on port 3001');
});
