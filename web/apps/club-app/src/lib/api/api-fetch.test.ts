import { describe, expect, it } from 'vitest';
import { buildApiUrl } from './api-fetch';

describe('buildApiUrl', () => {
  it.each([
    ['http://localhost:5100', '/auth/login', 'http://localhost:5100/auth/login'],
    ['http://localhost:5100/', '/auth/login', 'http://localhost:5100/auth/login'],
    ['http://localhost:5100///', '/auth/login', 'http://localhost:5100/auth/login'],
    ['http://localhost:5100', 'auth/login', 'http://localhost:5100/auth/login'],
    ['http://localhost:5100/', 'auth/login', 'http://localhost:5100/auth/login'],
  ])('joins base %s and path %s into %s', (baseUrl, path, expected) => {
    expect(buildApiUrl(baseUrl, path)).toBe(expected);
  });
});
