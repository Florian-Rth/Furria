import { isCompleteInvitationCode, normalizeInvitationCode } from './invitation-code';
import { readInvitationToken } from './invitation-token';

export type InvitationCredential =
  | { kind: 'token'; token: string }
  | { kind: 'code'; code: string };

export type InvitationCredentialBody = { token: string } | { code: string };

const CODE_PARAM = 'code';
const FRAGMENT_MARK = '#';

export const readInvitationCredential = (fragment: string): InvitationCredential | null => {
  const token = readInvitationToken(fragment);
  if (token !== null) {
    return { kind: 'token', token };
  }

  const body = fragment.startsWith(FRAGMENT_MARK) ? fragment.slice(1) : fragment;
  const code = normalizeInvitationCode(new URLSearchParams(body).get(CODE_PARAM) ?? '');

  return isCompleteInvitationCode(code) ? { kind: 'code', code } : null;
};

export const toCredentialBody = (credential: InvitationCredential): InvitationCredentialBody =>
  credential.kind === 'token' ? { token: credential.token } : { code: credential.code };

export const toCredentialKey = (credential: InvitationCredential | null): string | null => {
  if (credential === null) {
    return null;
  }

  return credential.kind === 'token' ? `token:${credential.token}` : `code:${credential.code}`;
};

export const toCodeFragment = (code: string): string =>
  new URLSearchParams({ [CODE_PARAM]: code }).toString();
