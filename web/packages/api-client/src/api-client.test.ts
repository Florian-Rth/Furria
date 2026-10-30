import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import type { ApiRequest, JsonBody, ResponseMismatch } from './api-client';
import { buildApiUrl, createApiClient, takeLines } from './api-client';
import type { ApiFailure } from './api-failure';
import { apiFailureOf } from './api-failure';

const ItemSchema = z.object({ id: z.int() });

type Outcome = { value: z.infer<typeof ItemSchema> | undefined } | { failure: ApiFailure | null };

const json = (status: number, body: JsonBody): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const outcomeOf = async (
  answer: () => Promise<Response>,
  schema: ApiRequest<z.infer<typeof ItemSchema> | undefined>['schema'] = ItemSchema,
): Promise<Outcome> => {
  const { apiFetch } = createApiClient({
    readBaseUrl: () => '',
    timeoutMs: 1_000,
    send: answer,
    reportMismatch: () => undefined,
  });

  try {
    return { value: await apiFetch('/api/items/1', { schema }) };
  } catch (error) {
    return { failure: error instanceof Error ? apiFailureOf(error) : null };
  }
};

describe('buildApiUrl', () => {
  it.each([
    ['', '/api/events', '/api/events'],
    ['https://api.example.org/', '/api/events', 'https://api.example.org/api/events'],
    ['https://api.example.org', 'api/events', 'https://api.example.org/api/events'],
  ])('joins the base %j and the path %j into %j', (baseUrl, path, url) => {
    expect(buildApiUrl(baseUrl, path)).toBe(url);
  });
});

describe('apiFetch', () => {
  it.each<[string, () => Response, Outcome]>([
    ['a body in the expected shape', () => json(200, { id: 7 }), { value: { id: 7 } }],
    ['a terminal 401', () => json(401, null), { failure: { kind: 'unauthorized' } }],
    ['a rate limit', () => json(429, { errors: {} }), { failure: { kind: 'throttled' } }],
    [
      'a 400 naming its fields',
      () => json(400, { errors: { FirstName: ['eins', 'zwei'], '': ['drei'] } }),
      {
        failure: {
          kind: 'refused',
          status: 400,
          fields: [
            { field: 'firstName', message: 'eins' },
            { field: 'firstName', message: 'zwei' },
            { field: '', message: 'drei' },
          ],
        },
      },
    ],
    [
      'a 409 explaining the conflict',
      () => json(409, { errors: { generalErrors: ['vergeben'] } }),
      {
        failure: {
          kind: 'refused',
          status: 409,
          fields: [{ field: 'generalErrors', message: 'vergeben' }],
        },
      },
    ],
    [
      'a 400 a proxy wrote',
      () => new Response('<html>Bad Request</html>', { status: 400 }),
      { failure: { kind: 'status', status: 400 } },
    ],
    [
      'a 404 with field failures',
      () => json(404, { errors: { id: ['weg'] } }),
      { failure: { kind: 'status', status: 404 } },
    ],
    ['a server failure', () => json(503, null), { failure: { kind: 'status', status: 503 } }],
    [
      'a body that drifted from the schema',
      () => json(200, { id: 'sieben' }),
      { failure: { kind: 'mismatch' } },
    ],
    [
      'a body that is no JSON at all',
      () => new Response('<html></html>', { status: 200 }),
      { failure: { kind: 'mismatch' } },
    ],
  ])('turns %s into its outcome', async (_case, response, expected) => {
    expect(await outcomeOf(() => Promise.resolve(response()))).toEqual(expected);
  });

  it.each([202, 204])('reads a %i as no content', async (status) => {
    expect(
      await outcomeOf(() => Promise.resolve(new Response(null, { status })), z.undefined()),
    ).toEqual({ value: undefined });
  });

  it('reports a request that never reached the API as unreachable', async () => {
    expect(await outcomeOf(() => Promise.reject(new TypeError('Failed to fetch')))).toEqual({
      failure: { kind: 'unreachable' },
    });
  });

  it('reads an empty success body as no content', async () => {
    expect(
      await outcomeOf(() => Promise.resolve(new Response('', { status: 200 })), z.undefined()),
    ).toEqual({ value: undefined });
  });

  it.each<[string, (signal: AbortSignal) => Promise<Response>, Outcome]>([
    [
      'an answer that never comes',
      (signal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(signal.reason));
        }),
      { failure: { kind: 'timedOut' } },
    ],
    [
      'a body that stops arriving',
      (signal) =>
        Promise.resolve(
          new Response(
            new ReadableStream({
              start: (controller) => {
                signal.addEventListener('abort', () => controller.error(signal.reason));
              },
            }),
            { status: 200 },
          ),
        ),
      { failure: { kind: 'timedOut' } },
    ],
    [
      'a connection that drops mid-body',
      () =>
        Promise.resolve(
          new Response(
            new ReadableStream({
              start: (controller) => {
                controller.error(new TypeError('network error'));
              },
            }),
            { status: 200 },
          ),
        ),
      { failure: { kind: 'unreachable' } },
    ],
  ])('turns %s into its outcome', async (_case, answer, expected) => {
    const { apiFetch } = createApiClient({
      readBaseUrl: () => '',
      timeoutMs: 5,
      send: (_url, init) => (init.signal ? answer(init.signal) : Promise.reject(new Error())),
      reportMismatch: () => undefined,
    });

    const outcome = await apiFetch('/api/items/1', { schema: ItemSchema }).then(
      (value): Outcome => ({ value }),
      (error: Error): Outcome => ({ failure: apiFailureOf(error) }),
    );

    expect(outcome).toEqual(expected);
  });

  it('names the drifted request and its issues to the mismatch report', async () => {
    const reports: ResponseMismatch[] = [];
    const { apiFetch } = createApiClient({
      readBaseUrl: () => '',
      timeoutMs: 1_000,
      send: () => Promise.resolve(json(200, { id: 'sieben' })),
      reportMismatch: (mismatch) => {
        reports.push(mismatch);
      },
    });

    await apiFetch('/api/items/1', { schema: ItemSchema, method: 'PUT', body: {} }).catch(
      () => undefined,
    );

    expect(reports.map(({ method, path, issues }) => [method, path, issues[0]?.path])).toEqual([
      ['PUT', '/api/items/1', ['id']],
    ]);
  });
});

interface SentRequest {
  url: string;
  method: string | undefined;
  headers: HeadersInit | undefined;
  body: BodyInit | null | undefined;
}

describe('the request the API receives', () => {
  it.each<[string, Omit<ApiRequest<undefined>, 'schema'>, Omit<SentRequest, 'url'>]>([
    ['a plain read', {}, { method: 'GET', headers: undefined, body: undefined }],
    [
      'an authorised write',
      { method: 'POST', body: { name: 'Kehraus' }, accessToken: 'token' },
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
        body: '{"name":"Kehraus"}',
      },
    ],
    [
      'an authorised removal',
      { method: 'DELETE', accessToken: 'token' },
      { method: 'DELETE', headers: { Authorization: 'Bearer token' }, body: undefined },
    ],
  ])('carries %s', async (_case, request, expected) => {
    const sent: SentRequest[] = [];
    const { apiFetch } = createApiClient({
      readBaseUrl: () => 'https://api.example.org/',
      timeoutMs: 1_000,
      send: (url, init) => {
        sent.push({ url, method: init.method, headers: init.headers, body: init.body });
        return Promise.resolve(new Response(null, { status: 204 }));
      },
    });

    await apiFetch('/api/items', { ...request, schema: z.undefined() });

    expect(sent).toEqual([{ url: 'https://api.example.org/api/items', ...expected }]);
  });
});

describe('takeLines', () => {
  it.each([
    ['{"id":1}\n{"id":2}\n{"id"', ['{"id":1}', '{"id":2}'], '{"id"'],
    ['{"id":1}', [], '{"id":1}'],
    ['\n\n{"id":3}\n', ['{"id":3}'], ''],
  ])('splits %j into whole lines and a rest', (pending, lines, rest) => {
    expect(takeLines(pending)).toEqual({ lines, rest });
  });
});

describe('apiStream', () => {
  const streamed = async (answer: () => Promise<Response>): Promise<Outcome[]> => {
    const { apiStream } = createApiClient({
      readBaseUrl: () => '',
      timeoutMs: 1_000,
      send: answer,
      reportMismatch: () => undefined,
    });
    const seen: Outcome[] = [];

    try {
      await apiStream('/api/items', {
        schema: ItemSchema,
        signal: new AbortController().signal,
        onLine: (value) => {
          seen.push({ value });
        },
      });
    } catch (error) {
      seen.push({ failure: error instanceof Error ? apiFailureOf(error) : null });
    }

    return seen;
  };

  it('hands over every line as it arrives, the last one without a line break too', async () => {
    expect(
      await streamed(async () => new Response('{"id":1}\n{"id":2}\n{"id":3}', { status: 200 })),
    ).toEqual([{ value: { id: 1 } }, { value: { id: 2 } }, { value: { id: 3 } }]);
  });

  it.each<[string, () => Promise<Response>, ApiFailure['kind']]>([
    ['a refusal', async () => json(422, { errors: { lines: ['x'] } }), 'refused'],
    ['an unknown line', async () => new Response('{"id":"a"}\n', { status: 200 }), 'mismatch'],
  ])('fails on %s', async (_name, answer, kind) => {
    const seen = await streamed(answer);
    const last = seen.at(-1);

    expect(last !== undefined && 'failure' in last ? last.failure?.kind : null).toBe(kind);
  });
});
