import type { ZodType } from 'zod';
import { z } from 'zod';
import type { ApiFailure, RefusalReading } from './api-failure';
import { ApiError, failureOfStatus, isRefusalStatus } from './api-failure';

export type JsonBody = string | number | boolean | null | JsonBody[] | { [key: string]: JsonBody };

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ApiRequest<TResponse> {
  schema: ZodType<TResponse>;
  method?: ApiMethod;
  body?: JsonBody;
  accessToken?: string;
}

export interface ResponseMismatch {
  method: ApiMethod;
  path: string;
  issues: readonly z.core.$ZodIssue[];
}

export type ApiFetch = <TResponse>(
  path: string,
  request: ApiRequest<TResponse>,
) => Promise<TResponse>;

export interface ApiStreamRequest<TLine> extends ApiRequest<TLine> {
  signal: AbortSignal;
  onLine: (line: TLine) => void;
}

export type ApiStream = <TLine>(path: string, request: ApiStreamRequest<TLine>) => Promise<void>;

export interface TakenLines {
  lines: string[];
  rest: string;
}

export interface ApiClientConfig {
  readBaseUrl: () => string;
  timeoutMs: number;
  send?: (url: string, init: RequestInit) => Promise<Response>;
  reportMismatch?: (mismatch: ResponseMismatch) => void;
}

export interface ApiClient {
  apiFetch: ApiFetch;
  apiStream: ApiStream;
  apiUrlOf: (path: string) => string;
}

const FailurePayloadSchema = z.object({ errors: z.record(z.string(), z.array(z.string())) });

const NO_CONTENT_STATUS = 204;
const ACCEPTED_STATUS = 202;

export const buildApiUrl = (baseUrl: string, path: string): string => {
  const base = baseUrl.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};

const toCamelCaseField = (field: string): string =>
  field.length === 0 ? field : `${field.charAt(0).toLowerCase()}${field.slice(1)}`;

const readRefusal = async (response: Response): Promise<RefusalReading | null> => {
  try {
    const payload: JsonBody = await response.json();
    const parsed = FailurePayloadSchema.safeParse(payload);

    return parsed.success
      ? {
          fields: Object.entries(parsed.data.errors).flatMap(([field, messages]) =>
            messages.map((message) => ({ field: toCamelCaseField(field), message })),
          ),
          payload,
        }
      : null;
  } catch {
    return null;
  }
};

const failureOfResponse = async (response: Response): Promise<ApiFailure> =>
  failureOfStatus(
    response.status,
    isRefusalStatus(response.status) ? await readRefusal(response) : null,
  );

const failureOfTransport = (signal: AbortSignal | null | undefined): ApiFailure =>
  signal?.aborted === true ? { kind: 'timedOut' } : { kind: 'unreachable' };

const readText = async (response: Response, init: RequestInit): Promise<string> => {
  try {
    return await response.text();
  } catch {
    throw new ApiError(failureOfTransport(init.signal));
  }
};

const readChunk = async (
  reader: ReadableStreamDefaultReader<string>,
  init: RequestInit,
): Promise<string | null> => {
  try {
    const { done, value } = await reader.read();

    return done ? null : value;
  } catch {
    throw new ApiError(failureOfTransport(init.signal));
  }
};

type BodyText = { parsed: true; value: JsonBody | undefined } | { parsed: false };

const parseJson = (text: string): BodyText => {
  if (text.trim().length === 0) {
    return { parsed: true, value: undefined };
  }
  try {
    return { parsed: true, value: JSON.parse(text) };
  } catch {
    return { parsed: false };
  }
};

type BodyReading<TResponse> =
  | { readable: true; value: TResponse }
  | { readable: false; issues: readonly z.core.$ZodIssue[] };

const parseBody = <TResponse>(
  schema: ZodType<TResponse>,
  body: JsonBody | undefined,
): BodyReading<TResponse> => {
  const parsed = schema.safeParse(body);

  return parsed.success
    ? { readable: true, value: parsed.data }
    : { readable: false, issues: parsed.error.issues };
};

const readBody = async <TResponse>(
  response: Response,
  init: RequestInit,
  schema: ZodType<TResponse>,
): Promise<BodyReading<TResponse>> => {
  if (response.status === NO_CONTENT_STATUS || response.status === ACCEPTED_STATUS) {
    return parseBody(schema, undefined);
  }

  const body = parseJson(await readText(response, init));

  return body.parsed ? parseBody(schema, body.value) : { readable: false, issues: [] };
};

export const takeLines = (pending: string): TakenLines => {
  const parts = pending.split('\n');
  const rest = parts.pop() ?? '';

  return { lines: parts.filter((line) => line.trim().length > 0), rest };
};

const toRequestInit = (
  method: ApiMethod,
  body: JsonBody | undefined,
  accessToken: string | undefined,
  timeoutMs: number,
): RequestInit => {
  const headers: Record<string, string> = {};
  const init: RequestInit = { method, signal: AbortSignal.timeout(timeoutMs) };

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

  return init;
};

const sendThroughFetch = (url: string, init: RequestInit): Promise<Response> => fetch(url, init);

const reportToConsole = (mismatch: ResponseMismatch): void => {
  console.error(
    `The API answered ${mismatch.method} ${mismatch.path} in an unknown shape.`,
    mismatch.issues,
  );
};

export const createApiClient = ({
  readBaseUrl,
  timeoutMs,
  send = sendThroughFetch,
  reportMismatch = reportToConsole,
}: ApiClientConfig): ApiClient => {
  const apiUrlOf = (path: string): string => buildApiUrl(readBaseUrl(), path);

  const sendOrFail = async (url: string, init: RequestInit): Promise<Response> => {
    try {
      return await send(url, init);
    } catch {
      throw new ApiError(failureOfTransport(init.signal));
    }
  };

  const apiFetch: ApiFetch = async (path, { schema, method = 'GET', body, accessToken }) => {
    const init = toRequestInit(method, body, accessToken, timeoutMs);
    const response = await sendOrFail(apiUrlOf(path), init);

    if (!response.ok) {
      throw new ApiError(await failureOfResponse(response));
    }

    const reading = await readBody(response, init, schema);

    if (!reading.readable) {
      reportMismatch({ method, path, issues: reading.issues });
      throw new ApiError({ kind: 'mismatch' });
    }

    return reading.value;
  };

  const readLine = <TLine>(
    path: string,
    method: ApiMethod,
    schema: ZodType<TLine>,
    text: string,
  ): TLine => {
    const body = parseJson(text);
    const reading: BodyReading<TLine> = body.parsed
      ? parseBody(schema, body.value)
      : { readable: false, issues: [] };

    if (!reading.readable) {
      reportMismatch({ method, path, issues: reading.issues });
      throw new ApiError({ kind: 'mismatch' });
    }

    return reading.value;
  };

  const apiStream: ApiStream = async (
    path,
    { schema, method = 'GET', body, accessToken, signal, onLine },
  ) => {
    const init = { ...toRequestInit(method, body, accessToken, timeoutMs), signal };
    const response = await sendOrFail(apiUrlOf(path), init);

    if (!response.ok) {
      throw new ApiError(await failureOfResponse(response));
    }

    if (response.body === null) {
      throw new ApiError({ kind: 'mismatch' });
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let pending = '';

    try {
      for (let chunk = await readChunk(reader, init); chunk !== null; ) {
        const taken = takeLines(pending + chunk);

        pending = taken.rest;
        for (const line of taken.lines) {
          onLine(readLine(path, method, schema, line));
        }
        chunk = await readChunk(reader, init);
      }
      if (pending.trim().length > 0) {
        onLine(readLine(path, method, schema, pending));
      }
    } finally {
      void reader.cancel().catch(() => undefined);
    }
  };

  return { apiFetch, apiStream, apiUrlOf };
};
