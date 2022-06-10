const express = require('express');
const app = express();
const cors = require('cors');

const callbackRouter = require('./routes/callback');
const eventsRouter = require('./routes/events');

// const lib = require('./lib');

//middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/callbacks', callbackRouter);
app.use('/events', eventsRouter);

app.listen('3001', () => {
  console.log('server running on port 3001');
});
