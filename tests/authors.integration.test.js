import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { pool } from '../src/config/dbConnect.js';
import { initializeDatabase } from '../src/config/initDb.js';

describe('Authors (integration)', () => {
  const createdAuthorIds = [];
  const testEmail = `author-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

  beforeAll(async () => {
    await initializeDatabase();
  });

  afterAll(async () => {
    if (createdAuthorIds.length > 0) {
      await pool.query('DELETE FROM authors WHERE id = ANY($1::int[])', [createdAuthorIds]);
    }
    await pool.end();
  });

  it('creates an author', async () => {
    const res = await request(app)
      .post('/authors')
      .send({ name: 'Test Author', email: testEmail, bio: 'bio' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Test Author', email: testEmail });
    createdAuthorIds.push(res.body.id);
  });

  it('gets an existing author', async () => {
    const res = await request(app).get(`/authors/${createdAuthorIds[0]}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testEmail);
  });

  it('rejects creating an author with a duplicate email', async () => {
    const res = await request(app)
      .post('/authors')
      .send({ name: 'Another Author', email: testEmail });

    expect(res.status).toBe(400);
  });

  it('returns 404 deleting a non-existent author', async () => {
    const res = await request(app).delete('/authors/999999999');

    expect(res.status).toBe(404);
  });
});
