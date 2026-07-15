const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');
const router = require('./routes');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(router);
app.get('/', (req, res) => {
  res.send('miniBlogAPI is running');
});

app.use(errorHandler);

module.exports = app;
