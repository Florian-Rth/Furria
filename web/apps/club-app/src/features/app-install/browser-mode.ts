export type BrowserModeIntent = 'enter' | 'leave';

export const BROWSER_MODE_PARAM = 'pwa';

const INTENTS: Record<string, BrowserModeIntent> = {
  false: 'enter',
  off: 'enter',
  '0': 'enter',
  true: 'leave',
  on: 'leave',
  '1': 'leave',
};

export const browserModeIntentOf = (search: string): BrowserModeIntent | null => {
  const value = new URLSearchParams(search).get(BROWSER_MODE_PARAM);
  return value === null ? null : (INTENTS[value.toLowerCase()] ?? null);
};

export const searchWithoutBrowserMode = (search: string): string => {
  const params = new URLSearchParams(search);
  params.delete(BROWSER_MODE_PARAM);
  const rest = params.toString();
  return rest === '' ? '' : `?${rest}`;
};
