const RESET_PARAM = 'reset';
const FRAGMENT_MARK = '#';
const RESET_PATTERN = /^[A-Za-z0-9_-]+$/;

export const readPasswordReset = (fragment: string): string | null => {
  const body = fragment.startsWith(FRAGMENT_MARK) ? fragment.slice(1) : fragment;
  const reset = new URLSearchParams(body).get(RESET_PARAM)?.trim() ?? '';

  return RESET_PATTERN.test(reset) ? reset : null;
};
