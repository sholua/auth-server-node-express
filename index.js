const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = require('./db');

app.get('/', (req, res) => {
  res.send('Hi there!!!');
});

const port = process.env.PORT || 5000;
app.listen(port, err => {
  console.log('Listening');
});