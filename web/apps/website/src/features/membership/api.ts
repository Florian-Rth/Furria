import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/api-fetch';
import type { MembershipApplicationPayload, MembershipApplicationResponse } from './schemas';
import { MembershipApplicationResponseSchema } from './schemas';

const submitMembershipApplication = (
  payload: MembershipApplicationPayload,
): Promise<MembershipApplicationResponse> =>
  apiFetch('/api/membership-applications', {
    method: 'POST',
    body: payload,
    schema: MembershipApplicationResponseSchema,
  });

export const useSubmitMembershipApplicationMutation = (): UseMutationResult<
  MembershipApplicationResponse,
  Error,
  MembershipApplicationPayload
> => useMutation({ mutationFn: submitMembershipApplication });
