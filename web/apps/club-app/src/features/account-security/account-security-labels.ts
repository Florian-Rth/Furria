import type { KkScreenOrigin } from '@furria/ui';
import { formatCountdown } from '@/lib/countdown';

export const SECURITY_TITLE = 'Anmeldung & Sicherheit';
export const SECURITY_PATH = '/profile/security';
export const SECURITY_ORIGIN: KkScreenOrigin = { label: SECURITY_TITLE, to: SECURITY_PATH };

export const LOGIN_EMAIL_EDIT_TITLE = 'Anmelde-E-Mail bearbeiten';
export const LOGIN_EMAIL_EDIT_PATH = '/profile/security/login-email';
export const PASSWORD_EDIT_TITLE = 'Passwort bearbeiten';
export const PASSWORD_EDIT_PATH = '/profile/security/password';

export const SECURITY_LANDINGS = {
  loginEmail: { kind: 'security', id: 'login-email' },
  password: { kind: 'security', id: 'password' },
} as const;

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
