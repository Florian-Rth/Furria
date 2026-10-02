import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/api-fetch';
import type { PublicBoardSeat, PublicGroup } from './schemas';
import { PublicBoardResponseSchema, PublicGroupsResponseSchema } from './schemas';

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

export const publicBoardKeys = {
  all: ['public-board'] as const,
};

const fetchPublicBoard = async (): Promise<PublicBoardSeat[]> => {
  const response = await apiFetch('/api/public/board', { schema: PublicBoardResponseSchema });

  return response.seats;
};

export const usePublicBoardQuery = (): UseQueryResult<PublicBoardSeat[], Error> =>
  useQuery({ queryKey: publicBoardKeys.all, queryFn: fetchPublicBoard });
