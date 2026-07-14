const { pool } = require('./src/config/dbConnect');
const { initializeDatabase } = require('./src/config/initDb');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await pool.query('SELECT 1');
  console.log('Conexão com PostgreSQL bem-sucedida');
  await initializeDatabase();
  console.log('Tabelas verificadas/criadas com sucesso');
};

startServer()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Falha ao conectar no PostgreSQL:', err.message);
    process.exit(1);
  });
