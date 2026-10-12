import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { requestStart } from './requests';
import type { Start } from './schemas';
import { isStartOfDay } from './start-refetch';

const START_STALE_MS = 30_000;
const START_GC_MS = 12 * 60 * 60 * 1000;

const ofToday = (start: Start): Start | undefined =>
  isStartOfDay(start, new Date()) ? start : undefined;

export const useStartQuery = (): UseQueryResult<Start | undefined, Error> =>
  useQuery({
    queryKey: queryKeys.start,
    queryFn: () => withFreshAccessToken(requestStart),
    select: ofToday,
    staleTime: START_STALE_MS,
    gcTime: START_GC_MS,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
