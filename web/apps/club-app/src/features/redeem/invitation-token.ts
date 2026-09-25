const TOKEN_PARAM = 'token';
const FRAGMENT_MARK = '#';
const TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;

export const INVITATION_PATH = '/invitation';

export const readInvitationToken = (fragment: string): string | null => {
  const body = fragment.startsWith(FRAGMENT_MARK) ? fragment.slice(1) : fragment;
  const token = new URLSearchParams(body).get(TOKEN_PARAM)?.trim() ?? '';

  return TOKEN_PATTERN.test(token) ? token : null;
};
