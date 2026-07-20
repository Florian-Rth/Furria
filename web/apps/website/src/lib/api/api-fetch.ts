import type { ZodType } from 'zod';
import { ApiError, RequestBlockedError } from './errors';

export type JsonBody = string | number | boolean | null | JsonBody[] | { [key: string]: JsonBody };

interface ApiFetchOptions<TResponse> {
  schema: ZodType<TResponse>;
  method?: 'GET' | 'POST';
  body?: JsonBody;
}

export const buildApiUrl = (baseUrl: string, path: string): string => {
  const base = baseUrl.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};

const fetchOrBlocked = async (url: string, init: RequestInit): Promise<Response> => {
  try {
    return await fetch(url, init);
  } catch {
    throw new RequestBlockedError();
  }
};

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
