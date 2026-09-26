import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useSessionSnapshot } from '@/features/session';
import { usePasskeySupport } from '@/lib/passkey/use-passkey-support';
import { DEFAULT_RETURN_TO } from '@/lib/return-to';
import { useInvitationLookupQuery, useRedeemInvitationMutation } from '../api';
import { toRedeemFailureKind } from '../redeem-failure';
import type { RedeemErrorMessages } from '../redeem-messages';
import { toRedeemErrorMessages } from '../redeem-messages';
import type {
  LiveInvitation,
  PendingClaim,
  PendingConfirmation,
  RedeemStage,
} from '../redeem-stage';
import { toRedeemStage } from '../redeem-stage';
import type { ClaimProof } from '../requests';
import type { Redemption } from '../schemas';
import { useInvitationCredential } from './use-invitation-credential';

interface ChosenLogin {
  loginEmail: string;
  password: string | null;
  updateContactEmail: boolean;
}

type PendingRedemption = PendingConfirmation & Pick<ChosenLogin, 'updateContactEmail'>;

const CLAIM_UPDATES_CONTACT_EMAIL = false;

interface RedeemAttempt {
  confirmationCode: string | null;
  claimProof: ClaimProof | null;
}

const FIRST_ATTEMPT: RedeemAttempt = { confirmationCode: null, claimProof: null };

const PASSKEY_CLAIM: ClaimProof = { kind: 'passkey' };

export interface RedeemScreenControl {
  stage: RedeemStage;
  isRedeeming: boolean;
  errors: RedeemErrorMessages;
  draftLoginEmail: string | null;
  hasResentCode: boolean;
  isOfferingPasskey: boolean;
  isPasskeySupported: boolean;
  submitDetails: (invitation: LiveInvitation, chosen: ChosenLogin) => void;
  confirm: (invitation: LiveInvitation, confirmationCode: string) => void;
  resendCode: (invitation: LiveInvitation) => void;
  claim: (invitation: LiveInvitation, loginEmail: string, claimPassword: string) => void;
  claimWithPasskey: (invitation: LiveInvitation, loginEmail: string) => void;
  changeLoginEmail: () => void;
  clearRefusal: () => void;
  retryLookup: () => void;
  enterApp: () => void;
}

export const useRedeemScreen = (): RedeemScreenControl => {
  const credential = useInvitationCredential();
  const { status } = useSessionSnapshot();
  const isSignedIn = status === 'authenticated';
  const lookup = useInvitationLookupQuery(credential, isSignedIn);
  const redemption = useRedeemInvitationMutation();
  const navigate = useNavigate();
  const [pending, setPending] = useState<PendingRedemption | null>(null);
  const [pendingClaim, setPendingClaim] = useState<PendingClaim | null>(null);
  const [hasDeclinedClaim, setHasDeclinedClaim] = useState(false);
  const [draftLoginEmail, setDraftLoginEmail] = useState<string | null>(null);
  const [hasResentCode, setHasResentCode] = useState(false);
  const [isOfferingPasskey, setIsOfferingPasskey] = useState(false);
  const isPasskeySupported = usePasskeySupport();

  const enterApp = (): void => {
    void navigate({ href: DEFAULT_RETURN_TO, replace: true });
  };

  const stage = toRedeemStage({
    credential,
    isSignedIn: isSignedIn && !redemption.isPending && !redemption.isSuccess,
    lookup: lookup.data,
    lookupFailure: toRedeemFailureKind(lookup.error),
    redeemFailure: toRedeemFailureKind(redemption.error),
    pendingConfirmation: pending,
    pendingClaim,
    hasDeclinedClaim,
  });

  const send = (
    invitation: LiveInvitation,
    chosen: ChosenLogin,
    attempt: RedeemAttempt,
    onConfirmationRequired: () => void,
  ): void => {
    const land = (outcome: Redemption): void => {
      const offersPasskey = isPasskeySupported && attempt.claimProof?.kind !== 'passkey';
      if (outcome.outcome === 'redeemed' && offersPasskey) {
        setIsOfferingPasskey(true);
        return;
      }
      if (outcome.outcome === 'redeemed') {
        enterApp();
        return;
      }
      if (outcome.outcome === 'claimRequired') {
        setPendingClaim(chosen);
        return;
      }

      setPending({ ...chosen, expiresAt: outcome.confirmationExpiresAt });
      onConfirmationRequired();
    };

    redemption.mutate(
      { credential: invitation.credential, ...chosen, ...attempt },
      { onSuccess: land },
    );
  };

  const submitDetails = (invitation: LiveInvitation, chosen: ChosenLogin): void => {
    setPending(null);
    setPendingClaim(null);
    setHasResentCode(false);
    setDraftLoginEmail(chosen.loginEmail);
    send(invitation, chosen, FIRST_ATTEMPT, () => undefined);
  };

  const confirm = (invitation: LiveInvitation, confirmationCode: string): void => {
    if (pending === null) {
      return;
    }

    send(invitation, pending, { ...FIRST_ATTEMPT, confirmationCode }, () => undefined);
  };

  const resendCode = (invitation: LiveInvitation): void => {
    if (pending === null) {
      return;
    }

    send(invitation, pending, FIRST_ATTEMPT, () => {
      setHasResentCode(true);
    });
  };

  const sendClaim = (
    invitation: LiveInvitation,
    loginEmail: string,
    claimProof: ClaimProof,
  ): void => {
    const chosen = {
      ...(pendingClaim ?? { loginEmail, password: null }),
      updateContactEmail: CLAIM_UPDATES_CONTACT_EMAIL,
    };

    send(invitation, chosen, { ...FIRST_ATTEMPT, claimProof }, () => undefined);
  };

  const claim = (invitation: LiveInvitation, loginEmail: string, claimPassword: string): void => {
    sendClaim(invitation, loginEmail, { kind: 'password', password: claimPassword });
  };

  const claimWithPasskey = (invitation: LiveInvitation, loginEmail: string): void => {
    sendClaim(invitation, loginEmail, PASSKEY_CLAIM);
  };

  const changeLoginEmail = (): void => {
    setPending(null);
    setPendingClaim(null);
    setHasDeclinedClaim(true);
    setHasResentCode(false);
    redemption.reset();
  };

  const clearRefusal = (): void => {
    if (redemption.error !== null) {
      redemption.reset();
    }
  };

  const retryLookup = (): void => {
    void lookup.refetch();
  };

  return {
    stage,
    isRedeeming: redemption.isPending || redemption.data?.outcome === 'redeemed',
    errors: toRedeemErrorMessages(redemption.error),
    draftLoginEmail,
    hasResentCode,
    isOfferingPasskey,
    isPasskeySupported,
    submitDetails,
    confirm,
    resendCode,
    claim,
    claimWithPasskey,
    changeLoginEmail,
    clearRefusal,
    retryLookup,
    enterApp,
  };
};
