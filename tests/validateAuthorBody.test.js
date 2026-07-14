import { describe, it, expect, vi } from 'vitest';
import validateAuthorBody from '../src/middlewares/validateAuthorBody.js';

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

describe('validateAuthorBody', () => {
  it('calls next() when creating with valid name and email', () => {
    const req = { method: 'POST', body: { name: 'Ana', email: 'ana@example.com' } };
    const res = createMockRes();
    const next = vi.fn();

    validateAuthorBody(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBeNull();
  });

  it('rejects creation missing name and/or email with 400', () => {
    const req = { method: 'POST', body: { email: 'ana@example.com' } };
    const res = createMockRes();
    const next = vi.fn();

    validateAuthorBody(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a non-string name with 400', () => {
    const req = { method: 'POST', body: { name: 123, email: 'ana@example.com' } };
    const res = createMockRes();
    const next = vi.fn();

    validateAuthorBody(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a non-string email with 400', () => {
    const req = { method: 'POST', body: { name: 'Ana', email: 123 } };
    const res = createMockRes();
    const next = vi.fn();

    validateAuthorBody(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a non-string bio with 400', () => {
    const req = { method: 'POST', body: { name: 'Ana', email: 'ana@example.com', bio: 42 } };
    const res = createMockRes();
    const next = vi.fn();

    validateAuthorBody(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows a null bio', () => {
    const req = { method: 'POST', body: { name: 'Ana', email: 'ana@example.com', bio: null } };
    const res = createMockRes();
    const next = vi.fn();

    validateAuthorBody(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('does not require name/email on update (PUT)', () => {
    const req = { method: 'PUT', body: { bio: 'updated bio' } };
    const res = createMockRes();
    const next = vi.fn();

    validateAuthorBody(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBeNull();
  });
});
