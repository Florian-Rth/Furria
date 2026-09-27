import type { InvitationCredential } from './invitation-credential';
import type { RedeemFailureKind } from './redeem-failure';
import type { InvitationLookup } from './schemas';

export type InvitationPurpose = Extract<InvitationLookup, { status: 'live' }>['purpose'];

export interface PendingConfirmation {
  loginEmail: string;
  password: string | null;
  expiresAt: string;
}

export interface PendingClaim {
  loginEmail: string;
  password: string | null;
}

export type RedeemStep =
  | { kind: 'details' }
  | { kind: 'confirm'; loginEmail: string; expiresAt: string }
  | { kind: 'claim'; loginEmail: string };

export interface LiveInvitation {
  credential: InvitationCredential;
  firstName: string;
  suggestedLoginEmail: string | null;
  contactEmailTaken: boolean;
  purpose: InvitationPurpose;
  claimableLoginEmail: string | null;
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
  pendingClaim: PendingClaim | null;
  hasDeclinedClaim: boolean;
}

interface RedeemStepInput {
  pendingConfirmation: PendingConfirmation | null;
  pendingClaim: PendingClaim | null;
  hasDeclinedClaim: boolean;
  claimableLoginEmail: string | null;
  redeemFailure: RedeemFailureKind | null;
}

const toRedeemStep = ({
  pendingConfirmation,
  pendingClaim,
  hasDeclinedClaim,
  claimableLoginEmail,
  redeemFailure,
}: RedeemStepInput): RedeemStep => {
  if (redeemFailure === 'taken') {
    return { kind: 'details' };
  }
  if (pendingClaim !== null) {
    return { kind: 'claim', loginEmail: pendingClaim.loginEmail };
  }
  if (pendingConfirmation === null && claimableLoginEmail !== null && !hasDeclinedClaim) {
    return { kind: 'claim', loginEmail: claimableLoginEmail };
  }
  if (pendingConfirmation === null) {
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
  pendingClaim,
  hasDeclinedClaim,
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
      purpose: lookup.purpose,
      claimableLoginEmail: lookup.claimableLoginEmail,
      step: toRedeemStep({
        pendingConfirmation,
        pendingClaim,
        hasDeclinedClaim,
        claimableLoginEmail: lookup.claimableLoginEmail,
        redeemFailure,
      }),
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
