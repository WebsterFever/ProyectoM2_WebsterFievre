const express = require('express');
const router = require('./routes');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const app = express();

app.use(express.json());
app.use(requestLogger);

app.use(router);
app.get('/', (req, res) => {
  res.send('miniBlogAPI is running');
});

app.use(errorHandler);

module.exports = app;
