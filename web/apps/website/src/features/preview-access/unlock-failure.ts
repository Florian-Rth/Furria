import { RequestBlockedError } from '@/lib/api/errors';

export class WrongPasswordError extends Error {
  constructor() {
    super('The preview password was rejected by the API.');
    this.name = 'WrongPasswordError';
  }
}

export type UnlockFailureKind = 'wrongPassword' | 'blocked' | 'unexpected';

const SUBMIT_ERROR_MESSAGES: Record<UnlockFailureKind, string> = {
  wrongPassword: 'Falsches Passwort. Bitte versuch es noch einmal.',
  blocked:
    'Die Anfrage hat den Server nicht erreicht. Falls du einen Werbeblocker oder Schutz-Add-on nutzt, erlaube diese Seite und versuch es erneut.',
  unexpected: 'Das hat leider nicht geklappt. Bitte versuch es später noch einmal.',
};

export const unlockFailureKindOf = (error: Error | null): UnlockFailureKind | null => {
  if (error === null) {
    return null;
  }

  if (error instanceof WrongPasswordError) {
    return 'wrongPassword';
  }

  if (error instanceof RequestBlockedError) {
    return 'blocked';
  }

  return 'unexpected';
};

export const toSubmitErrorMessage = (error: Error | null): string | null => {
  const kind = unlockFailureKindOf(error);

  return kind === null ? null : SUBMIT_ERROR_MESSAGES[kind];
};
