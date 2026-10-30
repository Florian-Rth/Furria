import { createApiClient } from '@furria/api-client';
import { readApiBaseUrl } from '@/lib/runtime-config';

const REQUEST_TIMEOUT_MS = 15_000;

export const { apiFetch, apiStream, apiUrlOf } = createApiClient({
  readBaseUrl: readApiBaseUrl,
  timeoutMs: REQUEST_TIMEOUT_MS,
});
