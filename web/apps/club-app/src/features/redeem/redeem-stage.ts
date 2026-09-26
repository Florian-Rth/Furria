import type { InvitationCredential } from './invitation-credential';
import type { RedeemFailureKind } from './redeem-failure';
import type { InvitationLookup } from './schemas';

export interface PendingConfirmation {
  loginEmail: string;
  password: string;
  expiresAt: string;
}

export type RedeemStep =
  | { kind: 'details' }
  | { kind: 'confirm'; loginEmail: string; expiresAt: string };

export interface LiveInvitation {
  credential: InvitationCredential;
  firstName: string;
  suggestedLoginEmail: string | null;
  contactEmailTaken: boolean;
}

export type RedeemStage =
  | { kind: 'checking' }
  | { kind: 'signedIn' }
  | { kind: 'dead' }
  | { kind: 'failed'; failure: RedeemFailureKind }
  | ({ kind: 'live'; step: RedeemStep } & LiveInvitation);

interface RedeemStageInput {
  credential: InvitationCredential | null;
  isSignedIn: boolean;
  lookup: InvitationLookup | undefined;
  lookupFailure: RedeemFailureKind | null;
  redeemFailure: RedeemFailureKind | null;
  pendingConfirmation: PendingConfirmation | null;
}

const toRedeemStep = (
  pendingConfirmation: PendingConfirmation | null,
  redeemFailure: RedeemFailureKind | null,
): RedeemStep => {
  if (pendingConfirmation === null || redeemFailure === 'taken') {
    return { kind: 'details' };
  }

  return {
    kind: 'confirm',
    loginEmail: pendingConfirmation.loginEmail,
    expiresAt: pendingConfirmation.expiresAt,
  };
};

export const toRedeemStage = ({
  credential,
  isSignedIn,
  lookup,
  lookupFailure,
  redeemFailure,
  pendingConfirmation,
}: RedeemStageInput): RedeemStage => {
  if (credential === null || redeemFailure === 'dead' || lookup?.status === 'dead') {
    return { kind: 'dead' };
  }
  if (isSignedIn) {
    return { kind: 'signedIn' };
  }
  if (lookup?.status === 'live') {
    return {
      kind: 'live',
      credential,
      firstName: lookup.firstName,
      suggestedLoginEmail: lookup.loginEmail,
      contactEmailTaken: lookup.contactEmailTaken,
      step: toRedeemStep(pendingConfirmation, redeemFailure),
    };
  }
  if (lookupFailure !== null) {
    return { kind: 'failed', failure: lookupFailure };
  }

  return { kind: 'checking' };
};

export const needsEmailConfirmation = (
  typedLoginEmail: string,
  suggestedLoginEmail: string | null,
): boolean => {
  const typed = typedLoginEmail.trim().toLowerCase();

  return typed !== '' && typed !== suggestedLoginEmail?.trim().toLowerCase();
};
