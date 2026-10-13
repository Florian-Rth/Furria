import { refusalMessageOf } from '@furria/api-client';
import type { ResetFailureKind } from './reset-failure';
import { toResetFailureKind } from './reset-failure';

const FOOTER_MESSAGES: Record<Exclude<ResetFailureKind, 'dead' | 'password'>, string> = {
  throttled: 'Zu viele Versuche mit diesem Link. Warte einen Moment und versuche es dann erneut.',
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  'timed-out': 'Der Server antwortet gerade zu langsam. Versuche es gleich noch einmal.',
  unexpected: 'Das hat nicht funktioniert. Bitte versuche es erneut.',
};

const FALLBACK_PASSWORD_MESSAGE = 'Dieses Passwort geht nicht. Wähle ein anderes.';

export interface ResetErrorMessages {
  password: string | null;
  footer: string | null;
}

const NO_ERRORS: ResetErrorMessages = { password: null, footer: null };

export const toResetErrorMessages = (error: Error | null): ResetErrorMessages => {
  const kind = toResetFailureKind(error);

  if (kind === null || kind === 'dead') {
    return NO_ERRORS;
  }
  if (kind === 'password') {
    return { ...NO_ERRORS, password: refusalMessageOf(error) ?? FALLBACK_PASSWORD_MESSAGE };
  }

  return { ...NO_ERRORS, footer: FOOTER_MESSAGES[kind] };
};
