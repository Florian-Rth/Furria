import type { KkScreenOrigin } from '@furria/ui';
import { format } from 'date-fns';
import { de } from 'date-fns/locale/de';
import { formatCountdown } from '@/lib/countdown';

export const SECURITY_TITLE = 'Anmeldung & Sicherheit';
export const SECURITY_PATH = '/profile/security';
export const SECURITY_ORIGIN: KkScreenOrigin = { label: SECURITY_TITLE, to: SECURITY_PATH };

export const LOGIN_EMAIL_EDIT_TITLE = 'Anmelde-E-Mail bearbeiten';
export const LOGIN_EMAIL_EDIT_PATH = '/profile/security/login-email';
export const PASSWORD_EDIT_TITLE = 'Passwort bearbeiten';
export const PASSWORD_EDIT_PATH = '/profile/security/password';
export const PASSKEY_PATH = '/profile/security/passkeys/$passkeyId';
export const PASSKEY_LANDING_KIND = 'passkey';

export const SECURITY_LANDINGS = {
  loginEmail: { kind: 'security', id: 'login-email' },
  password: { kind: 'security', id: 'password' },
} as const;

export const PASSKEY_ADDED_MESSAGE =
  'Dein Passkey ist eingerichtet. Ab jetzt meldest du dich auf diesem Gerät ohne Passwort an.';
export const PASSKEY_REMOVED_MESSAGE =
  'Der Passkey ist entfernt. Mit ihm meldest du dich nicht mehr an.';

export const PASSWORD_SAVED_MESSAGE =
  'Dein Passwort ist gespeichert. Auf deinen anderen Geräten bist du jetzt abgemeldet.';

export const CODE_EXPIRED_LINE = 'Der Code ist abgelaufen. Lass dir einen neuen schicken.';

export const toLoginEmailSavedMessage = (
  loginEmail: string,
  contactEmailFollowed: boolean,
): string =>
  contactEmailFollowed
    ? `Du meldest dich jetzt mit ${loginEmail} an. Deine Kontakt-E-Mail ist ebenfalls geändert.`
    : `Du meldest dich jetzt mit ${loginEmail} an. Deine Kontakt-E-Mail ist unverändert.`;

export const toCodeSentLine = (loginEmail: string): string =>
  `Wir haben dir einen Code an ${loginEmail} geschickt. Erst wenn du ihn eingibst, meldest du dich mit dieser Adresse an.`;

export const toCodeValidityLine = (secondsLeft: number): string =>
  secondsLeft > 0 ? `Der Code gilt noch ${formatCountdown(secondsLeft)}.` : CODE_EXPIRED_LINE;

const SAME_YEAR_PATTERN = 'd. MMM';
const OTHER_YEAR_PATTERN = 'd. MMM yyyy';

export const formatPasskeyDay = (addedAt: string, today: Date): string => {
  const added = new Date(addedAt);
  const pattern =
    added.getFullYear() === today.getFullYear() ? SAME_YEAR_PATTERN : OTHER_YEAR_PATTERN;

  return format(added, pattern, { locale: de });
};
