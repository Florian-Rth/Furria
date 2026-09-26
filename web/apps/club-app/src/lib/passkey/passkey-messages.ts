import { RequestFailedError } from '@/lib/api/api-error';
import type { PasskeyFailureKind } from './passkey-failure';
import { toPasskeyFailureKind } from './passkey-failure';

const PASSKEY_FAILURE_MESSAGES: Record<Exclude<PasskeyFailureKind, 'cancelled'>, string> = {
  'already-on-device': 'Auf diesem Gerät ist schon ein Passkey für dich eingerichtet.',
  rejected: 'Mit diesem Passkey kommst du nicht hinein. Melde dich mit deinem Passwort an.',
  refused: 'Der Passkey wurde nicht angenommen. Versuch es noch einmal.',
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Mit dem Passkey hat es nicht geklappt. Versuch es noch einmal.',
};

const toServerMessage = (error: Error): string | null =>
  error instanceof RequestFailedError ? (error.failures[0]?.message ?? null) : null;

export const toPasskeyErrorMessage = (error: Error | null): string | null => {
  if (error === null) {
    return null;
  }
  const kind = toPasskeyFailureKind(error);
  if (kind === 'cancelled') {
    return null;
  }

  return toServerMessage(error) ?? PASSKEY_FAILURE_MESSAGES[kind];
};
