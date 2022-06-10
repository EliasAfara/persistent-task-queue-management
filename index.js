const express = require('express');
const app = express();
const cors = require('cors');

const callbackRouter = require('./routes/callback');

//middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/callbacks', callbackRouter);

app.listen('3001', () => {
  console.log('server running on port 3001');
});
