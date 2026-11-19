import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import type { IntakeDecision } from './intake-decision';
import {
  DISCARDED_NOTICE,
  EDITED_NOTICE,
  RENEWED_NOTICE,
  toResolvedNotice,
  toStartedNotice,
} from './intake-labels';
import {
  requestIntake,
  requestIntakeDiscard,
  requestIntakeEdit,
  requestIntakeRenewal,
  requestIntakeResolution,
  requestIntakeStart,
  requestIntakes,
} from './requests';
import type {
  IntakeDetails,
  IntakesResponse,
  RenewedIntake,
  ResolvedIntake,
  StartedIntake,
} from './schemas';

export interface EditIntakeInput {
  intakeId: number;
  decision: IntakeDecision;
}

export interface ResolveIntakeInput {
  intakeId: number;
  personId: number | null;
  newcomerName: string;
}

export const useIntakesQuery = (): UseQueryResult<IntakesResponse, Error> =>
  useQuery({
    queryKey: queryKeys.intakes,
    queryFn: () => withFreshAccessToken(requestIntakes),
  });

export const useIntakeQuery = (intakeId: number | null): UseQueryResult<IntakeDetails, Error> => {
  const load =
    intakeId === null
      ? skipToken
      : (): Promise<IntakeDetails> =>
          withFreshAccessToken((accessToken) => requestIntake(intakeId, accessToken));

  return useQuery({ queryKey: queryKeys.intake(intakeId), queryFn: load });
};

export const useStartIntakeMutation = (): UseMutationResult<StartedIntake, Error, IntakeDecision> =>
  useApiMutation({
    request: (decision: IntakeDecision, accessToken) => requestIntakeStart(decision, accessToken),
    changes: ['intake'],
    notice: { success: (decision) => toStartedNotice(decision.label) },
  });

export const useEditIntakeMutation = (): UseMutationResult<void, Error, EditIntakeInput> =>
  useApiMutation({
    request: (input: EditIntakeInput, accessToken) =>
      requestIntakeEdit(input.intakeId, input.decision, accessToken),
    changes: ['intake'],
    notice: { success: () => EDITED_NOTICE },
  });

export const useRenewIntakeMutation = (): UseMutationResult<RenewedIntake, Error, number> =>
  useApiMutation({
    request: (intakeId: number, accessToken) => requestIntakeRenewal(intakeId, accessToken),
    changes: ['intake'],
    notice: { success: () => RENEWED_NOTICE, failure: (error) => toWriteErrorMessage(error) },
  });

export const useDiscardIntakeMutation = (): UseMutationResult<void, Error, number> =>
  useApiMutation({
    request: (intakeId: number, accessToken) => requestIntakeDiscard(intakeId, accessToken),
    changes: ['intake', 'media'],
    notice: { success: () => DISCARDED_NOTICE },
  });

export const useResolveIntakeMutation = (): UseMutationResult<
  ResolvedIntake,
  Error,
  ResolveIntakeInput
> =>
  useApiMutation({
    request: (input: ResolveIntakeInput, accessToken) =>
      requestIntakeResolution(input.intakeId, input.personId, accessToken),
    changes: ['intake', 'person', 'picture', 'membership', 'groupMembership', 'account', 'media'],
    notice: { success: (input) => toResolvedNotice(input.newcomerName, input.personId !== null) },
  });
