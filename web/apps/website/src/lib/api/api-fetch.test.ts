import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { apiFetch, buildApiUrl } from './api-fetch';
import { ApiError, RequestBlockedError } from './errors';

describe('buildApiUrl', () => {
  it('keeps the path relative when the base URL is empty', () => {
    expect(buildApiUrl('', '/api/events')).toBe('/api/events');
  });

  it('prefixes the path with the base URL', () => {
    expect(buildApiUrl('https://api.example.org', '/api/events')).toBe(
      'https://api.example.org/api/events',
    );
  });

  it('normalizes a trailing slash on the base URL', () => {
    expect(buildApiUrl('https://api.example.org/', '/api/events')).toBe(
      'https://api.example.org/api/events',
    );
  });

  it('normalizes a missing leading slash on the path', () => {
    expect(buildApiUrl('https://api.example.org', 'api/events')).toBe(
      'https://api.example.org/api/events',
    );
  });
});

const GreetingSchema = z.object({ greeting: z.string() });

const stubFetchResponse = (status: number, body: string): ReturnType<typeof vi.fn> => {
  const fetchMock = vi.fn(async () => new Response(body, { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('apiFetch', () => {
  it('returns the schema-parsed JSON body on success', async () => {
    stubFetchResponse(200, JSON.stringify({ greeting: 'Gross - Furria!', unexpected: true }));

    await expect(apiFetch('/api/greeting', { schema: GreetingSchema })).resolves.toEqual({
      greeting: 'Gross - Furria!',
    });
  });

  it('performs a plain GET without body or content-type by default', async () => {
    const fetchMock = stubFetchResponse(200, '{"greeting":"ok"}');

    await apiFetch('/api/greeting', { schema: GreetingSchema });

    expect(fetchMock).toHaveBeenCalledWith('/api/greeting', { method: 'GET' });
  });

  it('sends the body JSON-encoded with the matching content type', async () => {
    const fetchMock = stubFetchResponse(200, '{"greeting":"ok"}');

    await apiFetch('/api/greeting', {
      schema: GreetingSchema,
      method: 'POST',
      body: { name: 'Lisa' },
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/greeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"name":"Lisa"}',
    });
  });

  it('prefixes the request with the configured base URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.org');
    const fetchMock = stubFetchResponse(200, '{"greeting":"ok"}');

    await apiFetch('/api/greeting', { schema: GreetingSchema });

    expect(fetchMock).toHaveBeenCalledWith('https://api.example.org/api/greeting', {
      method: 'GET',
    });
  });

  it('throws an ApiError carrying the status when the API answers non-ok', async () => {
    stubFetchResponse(503, '{}');

    await expect(apiFetch('/api/greeting', { schema: GreetingSchema })).rejects.toMatchObject({
      name: 'ApiError',
      status: 503,
    });
  });

  it('throws a RequestBlockedError when fetch itself rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );

    await expect(apiFetch('/api/greeting', { schema: GreetingSchema })).rejects.toBeInstanceOf(
      RequestBlockedError,
    );
  });

  it('rejects a response body that does not match the schema', async () => {
    stubFetchResponse(200, JSON.stringify({ greeting: 11 }));

    await expect(apiFetch('/api/greeting', { schema: GreetingSchema })).rejects.toBeInstanceOf(
      z.ZodError,
    );
  });
});

describe('ApiError', () => {
  it('exposes the response status', () => {
    const error = new ApiError(418);

    expect(error.status).toBe(418);
    expect(error.message).toBe('The API responded with status 418.');
  });
});
