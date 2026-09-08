export const resolveApiBaseUrl = (
  runtimeApiBaseUrl: string | undefined,
  buildTimeApiBaseUrl: string | undefined,
): string => runtimeApiBaseUrl ?? buildTimeApiBaseUrl ?? '';

const readRuntimeConfig = (): RuntimeConfig | undefined =>
  typeof window === 'undefined' ? undefined : window.__RUNTIME_CONFIG__;

export const readApiBaseUrl = (): string =>
  resolveApiBaseUrl(readRuntimeConfig()?.API_BASE_URL, import.meta.env.VITE_API_BASE_URL);
