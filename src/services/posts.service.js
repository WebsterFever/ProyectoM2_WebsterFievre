const { pool } = require('../config/dbConnect');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM posts ORDER BY id');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);

  if (rows.length === 0) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }

  return rows[0];
}

async function findByAuthorId(authorId) {
  const { rows } = await pool.query('SELECT * FROM posts WHERE author_id = $1 ORDER BY id', [authorId]);
  return rows;
}

async function create({ title, content, author_id, published }) {
  const { rows } = await pool.query(
    `INSERT INTO posts (title, content, author_id, published)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, content, author_id, !!published]
  );
  return rows[0];
}

async function update(id, { title, content, author_id, published }) {
  const { rows } = await pool.query(
    `UPDATE posts SET
       title = COALESCE($1, title),
       content = COALESCE($2, content),
       author_id = COALESCE($3, author_id),
       published = COALESCE($4, published)
     WHERE id = $5
     RETURNING *`,
    [title, content, author_id, published, id]
  );
  return rows[0];
}

async function remove(id) {
  const { rows } = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
  return rows.length > 0;
}

module.exports = { findAll, findById, findByAuthorId, create, update, remove };
