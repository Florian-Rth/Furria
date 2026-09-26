import { secondsUntil } from '@/lib/countdown';
import type { AccountState, InPersonInvitation } from './schemas';

export type InPersonPhase =
  | { kind: 'issuing' }
  | { kind: 'failed' }
  | { kind: 'showing'; invitation: InPersonInvitation; secondsLeft: number }
  | { kind: 'expired'; invitation: InPersonInvitation }
  | { kind: 'redeemed' };

interface InPersonPhaseInput {
  invitation: InPersonInvitation | undefined;
  isIssuing: boolean;
  hasIssueFailed: boolean;
  state: AccountState | undefined;
  now: Date;
}

export const inPersonPhaseOf = ({
  invitation,
  isIssuing,
  hasIssueFailed,
  state,
  now,
}: InPersonPhaseInput): InPersonPhase => {
  if (state === 'active') {
    return { kind: 'redeemed' };
  }
  if (isIssuing) {
    return { kind: 'issuing' };
  }
  if (hasIssueFailed) {
    return { kind: 'failed' };
  }
  if (invitation === undefined) {
    return { kind: 'issuing' };
  }

  const secondsLeft = secondsUntil(invitation.expiresAt, now);

  return secondsLeft > 0
    ? { kind: 'showing', invitation, secondsLeft }
    : { kind: 'expired', invitation };
};

export const isCodeShowing = (
  invitation: InPersonInvitation | undefined,
  isIssuing: boolean,
  now: Date,
): boolean => invitation !== undefined && !isIssuing && secondsUntil(invitation.expiresAt, now) > 0;
