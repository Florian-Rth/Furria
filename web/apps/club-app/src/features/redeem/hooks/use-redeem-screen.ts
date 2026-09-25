import { useNavigate } from '@tanstack/react-router';
import { useSessionSnapshot } from '@/features/session';
import { DEFAULT_RETURN_TO } from '@/lib/return-to';
import { useInvitationLookupQuery, useRedeemInvitationMutation } from '../api';
import { toRedeemFailureKind } from '../redeem-failure';
import { toRedeemErrorMessage } from '../redeem-messages';
import type { RedeemStage } from '../redeem-stage';
import { toRedeemStage } from '../redeem-stage';
import { useInvitationToken } from './use-invitation-token';

export interface RedeemScreenControl {
  stage: RedeemStage;
  isRedeeming: boolean;
  redeemError: string | null;
  redeem: (token: string, password: string) => void;
  retryLookup: () => void;
}

export const useRedeemScreen = (): RedeemScreenControl => {
  const token = useInvitationToken();
  const { status } = useSessionSnapshot();
  const isSignedIn = status === 'authenticated';
  const lookup = useInvitationLookupQuery(token, isSignedIn);
  const redemption = useRedeemInvitationMutation();
  const navigate = useNavigate();

  const stage = toRedeemStage({
    token,
    isSignedIn: isSignedIn && !redemption.isPending && !redemption.isSuccess,
    lookup: lookup.data,
    lookupFailure: toRedeemFailureKind(lookup.error),
    redeemFailure: toRedeemFailureKind(redemption.error),
  });

  const redeem = (liveToken: string, password: string): void => {
    redemption.mutate(
      { token: liveToken, password },
      {
        onSuccess: () => {
          void navigate({ href: DEFAULT_RETURN_TO, replace: true });
        },
      },
    );
  };

  const retryLookup = (): void => {
    void lookup.refetch();
  };

  return {
    stage,
    isRedeeming: redemption.isPending || redemption.isSuccess,
    redeemError: toRedeemErrorMessage(redemption.error),
    redeem,
    retryLookup,
  };
};
