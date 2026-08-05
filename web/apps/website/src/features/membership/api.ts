import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/api-fetch';
import type { Group } from '@/lib/seed/groups';
import { GroupsSchema, SEEDED_GROUPS } from '@/lib/seed/groups';
import type { MembershipApplicationPayload, MembershipApplicationResponse } from './schemas';
import { MembershipApplicationResponseSchema } from './schemas';

export const groupKeys = {
  all: ['groups'] as const,
};

const fetchGroups = (): Promise<Group[]> => Promise.resolve(GroupsSchema.parse(SEEDED_GROUPS));

export const useGroupsQuery = (): UseQueryResult<Group[], Error> =>
  useQuery({ queryKey: groupKeys.all, queryFn: fetchGroups });

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
