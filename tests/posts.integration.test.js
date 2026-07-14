import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { pool } from '../src/config/dbConnect.js';
import { initializeDatabase } from '../src/config/initDb.js';

describe('Posts (integration)', () => {
  const createdPostIds = [];
  const testEmail = `post-author-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  let authorId;

  beforeAll(async () => {
    await initializeDatabase();
    const { rows } = await pool.query(
      'INSERT INTO authors (name, email) VALUES ($1, $2) RETURNING id',
      ['Post Test Author', testEmail]
    );
    authorId = rows[0].id;
  });

  afterAll(async () => {
    if (createdPostIds.length > 0) {
      await pool.query('DELETE FROM posts WHERE id = ANY($1::int[])', [createdPostIds]);
    }
    await pool.query('DELETE FROM authors WHERE id = $1', [authorId]);
    await pool.end();
  });

  it('creates a post', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: 'Test Post', content: 'Post content', author_id: authorId });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Test Post', author_id: authorId });
    createdPostIds.push(res.body.id);
  });

  it('gets an existing post', async () => {
    const res = await request(app).get(`/posts/${createdPostIds[0]}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Test Post');
  });

  it('rejects creating a post without required fields', async () => {
    const res = await request(app).post('/posts').send({ title: 'Missing content and author_id' });

    expect(res.status).toBe(400);
  });

  it('returns 404 deleting a non-existent post', async () => {
    const res = await request(app).delete('/posts/999999999');

    expect(res.status).toBe(404);
  });
});
