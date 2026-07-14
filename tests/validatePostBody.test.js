import { describe, it, expect, vi } from 'vitest';
import validatePostBody from '../src/middlewares/validatePostBody.js';

function createMockRes() {
  const res = { statusCode: null, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
}

describe('validatePostBody', () => {
  it('calls next() when creating with all required fields', () => {
    const req = { method: 'POST', body: { title: 'Title', content: 'Content', author_id: 1 } };
    const res = createMockRes();
    const next = vi.fn();

    validatePostBody(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBeNull();
  });

  it('rejects creation missing required fields with 400', () => {
    const req = { method: 'POST', body: { title: 'Title' } };
    const res = createMockRes();
    const next = vi.fn();

    validatePostBody(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a non-string title with 400', () => {
    const req = { method: 'POST', body: { title: 123, content: 'Content', author_id: 1 } };
    const res = createMockRes();
    const next = vi.fn();

    validatePostBody(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a non-string content with 400', () => {
    const req = { method: 'POST', body: { title: 'Title', content: 123, author_id: 1 } };
    const res = createMockRes();
    const next = vi.fn();

    validatePostBody(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a non-positive-integer author_id with 400', () => {
    const req = { method: 'POST', body: { title: 'Title', content: 'Content', author_id: 'abc' } };
    const res = createMockRes();
    const next = vi.fn();

    validatePostBody(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a non-boolean published with 400', () => {
    const req = {
      method: 'POST',
      body: { title: 'Title', content: 'Content', author_id: 1, published: 'yes' },
    };
    const res = createMockRes();
    const next = vi.fn();

    validatePostBody(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('does not require title/content/author_id on update (PUT)', () => {
    const req = { method: 'PUT', body: { published: true } };
    const res = createMockRes();
    const next = vi.fn();

    validatePostBody(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBeNull();
  });
});
