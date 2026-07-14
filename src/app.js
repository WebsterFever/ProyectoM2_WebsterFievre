const express = require('express');
const router = require('./routes');
const app = express();

app.use(express.json());

app.use(router);
app.get('/', (req, res) => {
  res.send('miniBlogAPI is running');
});


module.exports = app;
