import type { ZodType } from 'zod';
import { ApiError, RequestBlockedError } from './errors';

export type JsonBody = string | number | boolean | null | JsonBody[] | { [key: string]: JsonBody };

interface ApiFetchOptions<TResponse> {
  // Every response is Zod-parsed at the boundary — the schema is mandatory by design.
  schema: ZodType<TResponse>;
  method?: 'GET' | 'POST';
  body?: JsonBody;
}

// Pure so URL joining is directly testable. Tolerates a trailing slash on the
// base and a missing leading slash on the path.
export const buildApiUrl = (baseUrl: string, path: string): string => {
  const base = baseUrl.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};

const fetchOrBlocked = async (url: string, init: RequestInit): Promise<Response> => {
  try {
    return await fetch(url, init);
  } catch {
    // fetch itself rejecting means the request never got a response:
    // blocked by an extension/browser policy, offline, or DNS failure.
    throw new RequestBlockedError();
  }
};

// The one way the website talks to the backend API. Base URL comes from
// VITE_API_BASE_URL; empty/unset means same-origin relative requests (dev
// proxies /api to the backend, see vite.config.ts).
export const apiFetch = async <TResponse>(
  path: string,
  { schema, method = 'GET', body }: ApiFetchOptions<TResponse>,
): Promise<TResponse> => {
  const url = buildApiUrl(import.meta.env.VITE_API_BASE_URL ?? '', path);

  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }

  const response = await fetchOrBlocked(url, init);

  if (!response.ok) {
    throw new ApiError(response.status);
  }

  return schema.parse(await response.json());
};
