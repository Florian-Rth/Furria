import { refusalMessageOf } from '@furria/api-client';
import type { PasskeyFailureKind } from './passkey-failure';
import { toPasskeyFailureKind } from './passkey-failure';

const PASSKEY_FAILURE_MESSAGES: Record<Exclude<PasskeyFailureKind, 'cancelled'>, string> = {
  'already-on-device': 'Auf diesem Gerät ist schon ein Passkey für dich eingerichtet.',
  rejected: 'Mit diesem Passkey kommst du nicht hinein. Melde dich mit deinem Passwort an.',
  refused: 'Der Passkey wurde nicht angenommen. Versuch es noch einmal.',
  throttled:
    'Zu viele fehlgeschlagene Anmeldungen aus diesem Netz. Warte ein paar Minuten und versuche es dann erneut.',
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  'timed-out': 'Der Server antwortet gerade zu langsam. Versuche es gleich noch einmal.',
  unexpected: 'Mit dem Passkey hat es nicht geklappt. Versuch es noch einmal.',
};

export const toPasskeyErrorMessage = (error: Error | null): string | null => {
  if (error === null) {
    return null;
  }
  const kind = toPasskeyFailureKind(error);
  if (kind === 'cancelled') {
    return null;
  }

  return refusalMessageOf(error) ?? PASSKEY_FAILURE_MESSAGES[kind];
};
