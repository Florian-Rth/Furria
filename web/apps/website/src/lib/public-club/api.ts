import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/api-fetch';
import type { PublicClub } from './schemas';
import { PublicClubSchema } from './schemas';

export const publicClubKeys = {
  all: ['public-club'] as const,
};

const fetchPublicClub = (): Promise<PublicClub> =>
  apiFetch('/api/public/club', { schema: PublicClubSchema });

export const usePublicClubQuery = (): UseQueryResult<PublicClub, Error> =>
  useQuery({ queryKey: publicClubKeys.all, queryFn: fetchPublicClub });
