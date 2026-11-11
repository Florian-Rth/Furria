import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import { withAdmissionAges, withStance } from './group-matcher-page';
import { requestGroupMatcherPage, requestSetAdmissionAges, requestTakeStance } from './requests';
import type { AdmissionAgeBand, GroupMatcherPage, StanceInput } from './schemas';

const FAILURE_NOTICE = { failure: toWriteErrorMessage };
const STANCE_WRITES = 'group-matcher-stance';
const ADMISSION_AGE_WRITES = 'group-matcher-admission-ages';

export const useGroupMatcherPageQuery = (
  groupId: number | null,
): UseQueryResult<GroupMatcherPage, Error> => {
  const load =
    groupId === null
      ? skipToken
      : (): Promise<GroupMatcherPage> =>
          withFreshAccessToken((accessToken) => requestGroupMatcherPage(groupId, accessToken));

  return useQuery({ queryKey: queryKeys.groupMatcherPage(groupId), queryFn: load });
};

export const useTakeStanceMutation = (
  groupId: number,
): UseMutationResult<void, Error, StanceInput> =>
  useApiMutation({
    request: (stance: StanceInput, accessToken) => requestTakeStance(groupId, stance, accessToken),
    optimistic: [optimisticPatch(queryKeys.groupMatcherPage(groupId), withStance)],
    changes: ['groupMatcher'],
    key: [STANCE_WRITES, groupId],
    notice: FAILURE_NOTICE,
  });

export const useSetAdmissionAgesMutation = (
  groupId: number,
): UseMutationResult<void, Error, readonly AdmissionAgeBand[]> =>
  useApiMutation({
    request: (admissionAges: readonly AdmissionAgeBand[], accessToken) =>
      requestSetAdmissionAges(groupId, admissionAges, accessToken),
    optimistic: [optimisticPatch(queryKeys.groupMatcherPage(groupId), withAdmissionAges)],
    changes: ['groupMatcher'],
    key: [ADMISSION_AGE_WRITES, groupId],
    notice: FAILURE_NOTICE,
  });
