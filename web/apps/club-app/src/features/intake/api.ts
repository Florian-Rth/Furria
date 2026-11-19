import type { JsonBody } from '@furria/api-client';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/reads';
import { requestIntakeLinkLookup, requestIntakeSubmission } from './requests';
import type { IntakeLinkLookup, IntakeSubmitted } from './schemas';

export const useIntakeLinkLookupQuery = (
  token: string | null,
): UseQueryResult<IntakeLinkLookup, Error> =>
  useQuery({
    queryKey: queryKeys.intakeLinkLookup(token ?? ''),
    queryFn: token === null ? skipToken : () => requestIntakeLinkLookup(token),
    retry: false,
  });

export const useIntakeSubmission = (): UseMutationResult<IntakeSubmitted, Error, JsonBody> =>
  useMutation({ mutationFn: requestIntakeSubmission });
