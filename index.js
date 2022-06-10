const express = require('express');
const app = express();
const cors = require('cors');

//middleware
app.use(cors());
app.use(express.json());

app.listen('3001', () => {
  console.log('server running on port 3001');
});
