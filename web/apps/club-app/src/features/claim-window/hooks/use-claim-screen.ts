import { useNavigate } from '@tanstack/react-router';
import { INVITATION_PATH } from '@/features/redeem/invitation-token';
import { useClaimWindowStatusQuery, useWindowClaimMutation } from '../api';
import type { WindowClaimFailure } from '../claim-failure';
import { windowClaimFailureOf } from '../claim-failure';
import type { ClaimScreenView } from '../claim-screen-view';
import { claimScreenViewOf } from '../claim-screen-view';
import type { WindowClaim } from '../requests';

const TOKEN_FRAGMENT = 'token=';

interface ClaimScreenControl {
  view: ClaimScreenView;
  isClaiming: boolean;
  failure: WindowClaimFailure | null;
  claim: (claim: WindowClaim) => void;
  retry: () => void;
}

export const useClaimScreen = (): ClaimScreenControl => {
  const navigate = useNavigate();
  const status = useClaimWindowStatusQuery();
  const mutation = useWindowClaimMutation();
  const isOpen = status.isError ? true : (status.data?.isOpen ?? null);

  return {
    view: claimScreenViewOf(isOpen, mutation.data),
    isClaiming: mutation.isPending,
    failure: windowClaimFailureOf(mutation.error),
    claim: (claim) => {
      mutation.mutate(claim, {
        onSuccess: (result) => {
          if (result.outcome === 'invited' && result.token !== null) {
            void navigate({ to: INVITATION_PATH, hash: `${TOKEN_FRAGMENT}${result.token}` });
          }
        },
      });
    },
    retry: () => {
      mutation.reset();
    },
  };
};
