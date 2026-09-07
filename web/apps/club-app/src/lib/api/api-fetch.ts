import type { ZodType } from 'zod';
import { readApiBaseUrl } from '@/lib/runtime-config';
import { RequestBlockedError, ServerFailureError, UnauthorizedError } from './api-error';

export type JsonBody = string | number | boolean | null | JsonBody[] | { [key: string]: JsonBody };

interface ApiFetchOptions<TResponse> {
  schema: ZodType<TResponse>;
  method?: 'GET' | 'POST';
  body?: JsonBody;
  accessToken?: string;
}

const UNAUTHORIZED_STATUS = 401;
const NO_CONTENT_STATUS = 204;

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
  { schema, method = 'GET', body, accessToken }: ApiFetchOptions<TResponse>,
): Promise<TResponse> => {
  const url = buildApiUrl(readApiBaseUrl(), path);

  const headers: Record<string, string> = {};
  const init: RequestInit = { method };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  if (accessToken !== undefined) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  if (Object.keys(headers).length > 0) {
    init.headers = headers;
  }

  const response = await fetchOrBlocked(url, init);

  if (response.status === UNAUTHORIZED_STATUS) {
    throw new UnauthorizedError();
  }
  if (!response.ok) {
    throw new ServerFailureError(response.status);
  }
  if (response.status === NO_CONTENT_STATUS) {
    return schema.parse(undefined);
  }

  return schema.parse(await response.json());
};
