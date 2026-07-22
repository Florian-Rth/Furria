export const resolveApiBaseUrl = (
  runtimeApiBaseUrl: string | undefined,
  buildTimeApiBaseUrl: string | undefined,
): string => runtimeApiBaseUrl ?? buildTimeApiBaseUrl ?? '';

export const readApiBaseUrl = (): string =>
  resolveApiBaseUrl(window.__RUNTIME_CONFIG__?.API_BASE_URL, import.meta.env.VITE_API_BASE_URL);
