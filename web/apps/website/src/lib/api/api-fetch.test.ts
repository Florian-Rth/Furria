import { describe, expect, it } from 'vitest';
import { buildApiUrl } from './api-fetch';

describe('buildApiUrl', () => {
  it.each([
    ['', '/api/events', '/api/events'],
    ['https://api.example.org/', '/api/events', 'https://api.example.org/api/events'],
    ['https://api.example.org', 'api/events', 'https://api.example.org/api/events'],
  ])('joins the base %j and the path %j into %j', (baseUrl, path, url) => {
    expect(buildApiUrl(baseUrl, path)).toBe(url);
  });
});
