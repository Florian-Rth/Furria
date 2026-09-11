import type { ZodType } from 'zod';
import { readApiBaseUrl } from '@/lib/runtime-config';
import {
  RequestBlockedError,
  RequestFailedError,
  ServerFailureError,
  UnauthorizedError,
} from './api-error';
import { isRequestFailedStatus, readFailurePayload, toFieldFailures } from './api-failures';

export type JsonBody = string | number | boolean | null | JsonBody[] | { [key: string]: JsonBody };

interface ApiFetchOptions<TResponse> {
  schema: ZodType<TResponse>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: JsonBody;
  accessToken?: string;
}

const UNAUTHORIZED_STATUS = 401;
const NO_CONTENT_STATUS = 204;
const REQUEST_TIMEOUT_MS = 15_000;

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

const toFailure = async (response: Response): Promise<Error> => {
  if (!isRequestFailedStatus(response.status)) {
    return new ServerFailureError(response.status);
  }

  const payload = await readFailurePayload(response);

  if (payload === null) {
    return new ServerFailureError(response.status);
  }

  return new RequestFailedError(response.status, toFieldFailures(payload));
};

export const apiFetch = async <TResponse>(
  path: string,
  { schema, method = 'GET', body, accessToken }: ApiFetchOptions<TResponse>,
): Promise<TResponse> => {
  const url = buildApiUrl(readApiBaseUrl(), path);

  const headers: Record<string, string> = {};
  const init: RequestInit = { method, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) };

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
    throw await toFailure(response);
  }
  if (response.status === NO_CONTENT_STATUS) {
    return schema.parse(undefined);
  }

  return schema.parse(await response.json());
};
