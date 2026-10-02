import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/api-fetch';
import type { PublicGroup } from './schemas';
import { PublicGroupsResponseSchema } from './schemas';

export const publicGroupKeys = {
  all: ['public-groups'] as const,
};

const fetchPublicGroups = async (): Promise<PublicGroup[]> => {
  const response = await apiFetch('/api/public/groups', {
    schema: PublicGroupsResponseSchema,
  });

  return response.groups;
};

export const usePublicGroupsQuery = (): UseQueryResult<PublicGroup[], Error> =>
  useQuery({ queryKey: publicGroupKeys.all, queryFn: fetchPublicGroups });
