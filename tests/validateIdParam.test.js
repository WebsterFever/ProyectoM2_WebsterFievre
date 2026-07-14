import { describe, it, expect, vi } from 'vitest';
import validateIdParam from '../src/middlewares/validateIdParam.js';

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

describe('validateIdParam', () => {
  it('calls next() when the param is a positive integer', () => {
    const req = { params: { id: '42' } };
    const res = createMockRes();
    const next = vi.fn();

    validateIdParam('id')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBeNull();
  });

  it('rejects a non-numeric id with 400', () => {
    const req = { params: { id: 'abc' } };
    const res = createMockRes();
    const next = vi.fn();

    validateIdParam('id')(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a negative number with 400', () => {
    const req = { params: { id: '-1' } };
    const res = createMockRes();
    const next = vi.fn();

    validateIdParam('id')(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a decimal number with 400', () => {
    const req = { params: { id: '1.5' } };
    const res = createMockRes();
    const next = vi.fn();

    validateIdParam('id')(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('uses the given param name in the error message', () => {
    const req = { params: { authorId: 'abc' } };
    const res = createMockRes();
    const next = vi.fn();

    validateIdParam('authorId')(req, res, next);

    expect(res.body.error).toContain('authorId');
  });
});
