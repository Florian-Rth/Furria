import { RequestFailedError } from '@/lib/api/api-error';
import type { RedeemFailureKind } from './redeem-failure';
import { toRedeemFailureKind } from './redeem-failure';

const REDEEM_FAILURE_MESSAGES: Record<RedeemFailureKind, string> = {
  dead: 'Diese Einladung gilt nicht mehr.',
  throttled: 'Zu viele Versuche. Warte einen Moment und versuche es dann erneut.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Das hat nicht funktioniert. Bitte versuche es erneut.',
};

export const toRedeemFailureMessage = (failure: RedeemFailureKind): string =>
  REDEEM_FAILURE_MESSAGES[failure];

export const toRedeemErrorMessage = (error: Error | null): string | null => {
  const failure = toRedeemFailureKind(error);

  if (failure === null) {
    return null;
  }
  if (error instanceof RequestFailedError && failure === 'rejected') {
    return error.firstMessage;
  }

  return toRedeemFailureMessage(failure);
};

export const toGreeting = (firstName: string): string => `HALLO ${firstName.toUpperCase()}`;
