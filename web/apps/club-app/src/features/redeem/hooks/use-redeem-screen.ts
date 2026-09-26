import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useSessionSnapshot } from '@/features/session';
import { DEFAULT_RETURN_TO } from '@/lib/return-to';
import { useInvitationLookupQuery, useRedeemInvitationMutation } from '../api';
import { toRedeemFailureKind } from '../redeem-failure';
import type { RedeemErrorMessages } from '../redeem-messages';
import { toRedeemErrorMessages } from '../redeem-messages';
import type { LiveInvitation, PendingConfirmation, RedeemStage } from '../redeem-stage';
import { toRedeemStage } from '../redeem-stage';
import type { Redemption } from '../schemas';
import { useInvitationCredential } from './use-invitation-credential';

interface ChosenLogin {
  loginEmail: string;
  password: string;
}

export interface RedeemScreenControl {
  stage: RedeemStage;
  isRedeeming: boolean;
  errors: RedeemErrorMessages;
  draftLoginEmail: string | null;
  hasResentCode: boolean;
  submitDetails: (invitation: LiveInvitation, chosen: ChosenLogin) => void;
  confirm: (invitation: LiveInvitation, confirmationCode: string) => void;
  resendCode: (invitation: LiveInvitation) => void;
  changeLoginEmail: () => void;
  clearRefusal: () => void;
  retryLookup: () => void;
}

export const useRedeemScreen = (): RedeemScreenControl => {
  const credential = useInvitationCredential();
  const { status } = useSessionSnapshot();
  const isSignedIn = status === 'authenticated';
  const lookup = useInvitationLookupQuery(credential, isSignedIn);
  const redemption = useRedeemInvitationMutation();
  const navigate = useNavigate();
  const [pending, setPending] = useState<PendingConfirmation | null>(null);
  const [draftLoginEmail, setDraftLoginEmail] = useState<string | null>(null);
  const [hasResentCode, setHasResentCode] = useState(false);

  const stage = toRedeemStage({
    credential,
    isSignedIn: isSignedIn && !redemption.isPending && !redemption.isSuccess,
    lookup: lookup.data,
    lookupFailure: toRedeemFailureKind(lookup.error),
    redeemFailure: toRedeemFailureKind(redemption.error),
    pendingConfirmation: pending,
  });

  const send = (
    invitation: LiveInvitation,
    chosen: ChosenLogin,
    confirmationCode: string | null,
    onConfirmationRequired: () => void,
  ): void => {
    const land = (outcome: Redemption): void => {
      if (outcome.outcome === 'redeemed') {
        void navigate({ href: DEFAULT_RETURN_TO, replace: true });
        return;
      }

      setPending({ ...chosen, expiresAt: outcome.confirmationExpiresAt });
      onConfirmationRequired();
    };

    redemption.mutate(
      { credential: invitation.credential, ...chosen, confirmationCode },
      { onSuccess: land },
    );
  };

  const submitDetails = (invitation: LiveInvitation, chosen: ChosenLogin): void => {
    setPending(null);
    setHasResentCode(false);
    setDraftLoginEmail(chosen.loginEmail);
    send(invitation, chosen, null, () => undefined);
  };

  const confirm = (invitation: LiveInvitation, confirmationCode: string): void => {
    if (pending === null) {
      return;
    }

    send(invitation, pending, confirmationCode, () => undefined);
  };

  const resendCode = (invitation: LiveInvitation): void => {
    if (pending === null) {
      return;
    }

    send(invitation, pending, null, () => {
      setHasResentCode(true);
    });
  };

  const changeLoginEmail = (): void => {
    setPending(null);
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
    submitDetails,
    confirm,
    resendCode,
    changeLoginEmail,
    clearRefusal,
    retryLookup,
  };
};
