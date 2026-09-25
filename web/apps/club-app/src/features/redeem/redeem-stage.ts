import type { RedeemFailureKind } from './redeem-failure';
import type { InvitationLookup } from './schemas';

export type RedeemStage =
  | { kind: 'checking' }
  | { kind: 'signedIn' }
  | { kind: 'dead' }
  | { kind: 'failed'; failure: RedeemFailureKind }
  | { kind: 'live'; token: string; firstName: string; loginEmail: string };

interface RedeemStageInput {
  token: string | null;
  isSignedIn: boolean;
  lookup: InvitationLookup | undefined;
  lookupFailure: RedeemFailureKind | null;
  redeemFailure: RedeemFailureKind | null;
}

export const toRedeemStage = ({
  token,
  isSignedIn,
  lookup,
  lookupFailure,
  redeemFailure,
}: RedeemStageInput): RedeemStage => {
  if (token === null || redeemFailure === 'dead' || lookup?.status === 'dead') {
    return { kind: 'dead' };
  }
  if (isSignedIn) {
    return { kind: 'signedIn' };
  }
  if (lookup?.status === 'live') {
    return { kind: 'live', token, firstName: lookup.firstName, loginEmail: lookup.loginEmail };
  }
  if (lookupFailure !== null) {
    return { kind: 'failed', failure: lookupFailure };
  }

  return { kind: 'checking' };
};
