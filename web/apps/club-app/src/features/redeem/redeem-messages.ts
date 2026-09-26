import { RequestFailedError } from '@/lib/api/api-error';
import type { RedeemFailureKind } from './redeem-failure';
import { toRedeemFailureKind } from './redeem-failure';
import type { InvitationPurpose } from './redeem-stage';

const REDEEM_FAILURE_MESSAGES: Record<RedeemFailureKind, string> = {
  dead: 'Diese Einladung gilt nicht mehr.',
  taken: 'Diese E-Mail-Adresse gehört schon zu einem Zugang. Wähle eine andere.',
  codeRejected: 'Der Code stimmt nicht oder gilt nicht mehr.',
  claimRejected: 'Das Passwort passt nicht zu diesem Zugang.',
  throttled: 'Zu viele Versuche. Warte einen Moment und versuche es dann erneut.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Das hat nicht funktioniert. Bitte versuche es erneut.',
};

export interface RedeemErrorMessages {
  loginEmail: string | null;
  confirmationCode: string | null;
  claimPassword: string | null;
  footer: string | null;
}

const NO_ERRORS: RedeemErrorMessages = {
  loginEmail: null,
  confirmationCode: null,
  claimPassword: null,
  footer: null,
};

export const toRedeemFailureMessage = (failure: RedeemFailureKind): string =>
  REDEEM_FAILURE_MESSAGES[failure];

const toServerMessage = (error: Error, failure: RedeemFailureKind): string =>
  error instanceof RequestFailedError ? error.firstMessage : toRedeemFailureMessage(failure);

export const toRedeemErrorMessages = (error: Error | null): RedeemErrorMessages => {
  const failure = toRedeemFailureKind(error);

  if (error === null || failure === null) {
    return NO_ERRORS;
  }
  if (failure === 'taken') {
    return { ...NO_ERRORS, loginEmail: toServerMessage(error, failure) };
  }
  if (failure === 'codeRejected') {
    return { ...NO_ERRORS, confirmationCode: toServerMessage(error, failure) };
  }
  if (failure === 'claimRejected') {
    return { ...NO_ERRORS, claimPassword: toServerMessage(error, failure) };
  }
  if (failure === 'rejected') {
    return { ...NO_ERRORS, footer: toServerMessage(error, failure) };
  }

  return { ...NO_ERRORS, footer: toRedeemFailureMessage(failure) };
};

export const toGreeting = (firstName: string): string => `HALLO ${firstName.toUpperCase()}`;

export const toRedeemHeading = (purpose: InvitationPurpose, firstName: string): string =>
  purpose === 'recovery' ? `NEUES PASSWORT FÜR ${firstName.toUpperCase()}` : toGreeting(firstName);

export const toConfirmationSentLine = (loginEmail: string): string =>
  `Wir haben dir einen Code an ${loginEmail} geschickt. Gib ihn hier ein, dann ist die Adresse bestätigt.`;

export const toCodeValidityLine = (countdown: string): string => `Der Code gilt noch ${countdown}.`;
