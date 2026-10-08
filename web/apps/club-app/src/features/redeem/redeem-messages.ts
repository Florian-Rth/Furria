import { RequestFailedError } from '@/lib/api/api-error';
import type { RedeemFailureKind } from './redeem-failure';
import { toRedeemFailureKind } from './redeem-failure';
import type { InvitationPurpose } from './redeem-stage';

const REDEEM_FAILURE_MESSAGES: Record<RedeemFailureKind, string> = {
  dead: 'Diese Einladung gilt nicht mehr.',
  taken: 'Diese E-Mail-Adresse gehört schon zu einem Zugang. Wähle eine andere.',
  codeRejected: 'Der Code stimmt nicht oder gilt nicht mehr.',
  claimRejected: 'Das Passwort passt nicht zu diesem Zugang.',
  claimPasskeyRejected: 'Mit dem Passkey hat es nicht geklappt. Versuch es noch einmal.',
  passkeyCancelled: 'Die Bestätigung mit dem Passkey wurde abgebrochen.',
  throttled: 'Zu viele Versuche. Warte einen Moment und versuche es dann erneut.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Das hat nicht funktioniert. Bitte versuche es erneut.',
};

export interface RedeemErrorMessages {
  loginEmail: string | null;
  confirmationCode: string | null;
  claimPassword: string | null;
  claimPasskey: string | null;
  footer: string | null;
}

const NO_ERRORS: RedeemErrorMessages = {
  loginEmail: null,
  confirmationCode: null,
  claimPassword: null,
  claimPasskey: null,
  footer: null,
};

export const toRedeemFailureMessage = (failure: RedeemFailureKind): string =>
  REDEEM_FAILURE_MESSAGES[failure];

export type RedeemErrorSlot = keyof RedeemErrorMessages;

export interface RedeemErrorPlacement {
  slot: RedeemErrorSlot;
  failure: RedeemFailureKind;
  fromServer: boolean;
}

const FIELD_SLOTS: Partial<Record<RedeemFailureKind, RedeemErrorSlot>> = {
  taken: 'loginEmail',
  codeRejected: 'confirmationCode',
  claimRejected: 'claimPassword',
  claimPasskeyRejected: 'claimPasskey',
};

const SERVER_WORDED_FAILURES: ReadonlySet<RedeemFailureKind> = new Set<RedeemFailureKind>([
  'taken',
  'codeRejected',
  'claimRejected',
  'claimPasskeyRejected',
  'rejected',
]);

export const redeemErrorPlacementOf = (error: Error | null): RedeemErrorPlacement | null => {
  const failure = toRedeemFailureKind(error);

  if (failure === null || failure === 'passkeyCancelled') {
    return null;
  }

  return {
    slot: FIELD_SLOTS[failure] ?? 'footer',
    failure,
    fromServer: SERVER_WORDED_FAILURES.has(failure) && error instanceof RequestFailedError,
  };
};

const toPlacedMessage = (error: Error | null, placement: RedeemErrorPlacement): string =>
  placement.fromServer && error instanceof RequestFailedError
    ? error.firstMessage
    : toRedeemFailureMessage(placement.failure);

export const toRedeemErrorMessages = (error: Error | null): RedeemErrorMessages => {
  const placement = redeemErrorPlacementOf(error);

  if (placement === null) {
    return NO_ERRORS;
  }

  return { ...NO_ERRORS, [placement.slot]: toPlacedMessage(error, placement) };
};

export const toGreeting = (firstName: string): string => `HALLO ${firstName.toUpperCase()}`;

export const toRedeemHeading = (purpose: InvitationPurpose, firstName: string): string =>
  purpose === 'recovery' ? `NEUES PASSWORT FÜR ${firstName.toUpperCase()}` : toGreeting(firstName);

export const toConfirmationSentLine = (loginEmail: string): string =>
  `Wir haben dir einen Code an ${loginEmail} geschickt. Gib ihn hier ein, dann ist die Adresse bestätigt.`;

export const toCodeValidityLine = (countdown: string): string => `Der Code gilt noch ${countdown}.`;
