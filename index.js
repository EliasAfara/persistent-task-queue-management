const express = require('express');
const app = express();
const cors = require('cors');
const EventEmitter = require('events');
const { pgClient } = require('./db');
const lib = require('./lib');
const eventEmitter = new EventEmitter();

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
      console.log('row added', payload);
      const { data, callback_id } = payload;
      const callback_label = await lib.getEventCallback(callback_id);

      switch (callback_label) {
        case 'add':
          lib.add(data.x, data.y);
          break;
        case 'subtract':
          lib.subtract(data.x, data.y);
          break;
        case 'divide':
          lib.divide(data.x, data.y);
          break;
        case 'multiply':
          lib.multiply(data.x, data.y);
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
