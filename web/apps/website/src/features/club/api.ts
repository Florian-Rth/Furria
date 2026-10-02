import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/api-fetch';
import type { PublicBoardSeat } from './schemas';
import { PublicBoardResponseSchema } from './schemas';

export const publicBoardKeys = {
  all: ['public-board'] as const,
};

const fetchPublicBoard = async (): Promise<PublicBoardSeat[]> => {
  const response = await apiFetch('/api/public/board', { schema: PublicBoardResponseSchema });

  return response.seats;
};

export const usePublicBoardQuery = (): UseQueryResult<PublicBoardSeat[], Error> =>
  useQuery({ queryKey: publicBoardKeys.all, queryFn: fetchPublicBoard });
