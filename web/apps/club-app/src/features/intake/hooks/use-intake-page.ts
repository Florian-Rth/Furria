import type { JsonBody } from '@furria/api-client';
import { apiStatusOf } from '@furria/api-client';
import type { UseMutationResult } from '@tanstack/react-query';
import { useLocation } from '@tanstack/react-router';
import { tokenOfHash } from '@/lib/link-token';
import { useIntakeLinkLookupQuery, useIntakeSubmission } from '../api';
import type { IntakeClosedReason } from '../intake-copy';
import { intakePageStageOf } from '../intake-page';
import type { IntakeSubmitted } from '../schemas';

export interface OpenIntake {
  token: string;
  clubName: string | null;
  addressRequired: boolean;
  keepsClubGroup: boolean;
}

export interface OpenIntakePage {
  stage: 'open';
  intake: OpenIntake;
  submission: UseMutationResult<IntakeSubmitted, Error, JsonBody>;
  recheck: () => void;
}

export type IntakePage =
  | OpenIntakePage
  | { stage: 'done'; submitted: IntakeSubmitted }
  | { stage: 'checking' }
  | { stage: 'failed'; checking: boolean; recheck: () => void }
  | { stage: IntakeClosedReason };

export const useIntakePage = (): IntakePage => {
  const submission = useIntakeSubmission();
  const { hash } = useLocation();
  const token = tokenOfHash(hash);
  const lookup = useIntakeLinkLookupQuery(token);
  const { refetch } = lookup;
  const recheck = (): void => {
    void refetch();
  };

  if (submission.data !== undefined) {
    return { stage: 'done', submitted: submission.data };
  }

  const stage = intakePageStageOf(token, {
    state: lookup.data?.state ?? null,
    failedStatus: apiStatusOf(lookup.error),
    failed: lookup.isError,
  });

  switch (stage) {
    case 'open':
      return token === null || lookup.data === undefined
        ? { stage: 'checking' }
        : {
            stage,
            intake: {
              token,
              clubName: lookup.data.clubName,
              addressRequired: lookup.data.addressRequired,
              keepsClubGroup: lookup.data.keepsClubGroup,
            },
            submission,
            recheck,
          };
    case 'failed':
      return { stage, checking: lookup.isFetching, recheck };
    default:
      return { stage };
  }
};
