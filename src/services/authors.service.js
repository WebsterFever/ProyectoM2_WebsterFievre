const { pool } = require('../config/dbConnect');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM authors ORDER BY id');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM authors WHERE id = $1', [id]);
  return rows[0];
}

async function create({ name, email, bio }) {
  const { rows } = await pool.query(
    'INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) RETURNING *',
    [name, email, bio]
  );
  return rows[0];
}

async function update(id, { name, email, bio }) {
  const { rows } = await pool.query(
    `UPDATE authors SET
       name = COALESCE($1, name),
       email = COALESCE($2, email),
       bio = COALESCE($3, bio)
     WHERE id = $4
     RETURNING *`,
    [name, email, bio, id]
  );
  return rows[0];
}

async function remove(id) {
  const { rows } = await pool.query('DELETE FROM authors WHERE id = $1 RETURNING id', [id]);
  return rows.length > 0;
}

module.exports = { findAll, findById, create, update, remove };
