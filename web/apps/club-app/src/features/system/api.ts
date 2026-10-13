import type {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryResult,
  UseQueryResult,
} from '@tanstack/react-query';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { requestSystemLogs, requestSystemStatus } from './requests';
import type { LogPage, SystemStatus } from './schemas';
import type { LogFilter } from './types';

const STATUS_POLL_MS = 10_000;
const LOG_HEAD_POLL_MS = 15_000;
const LOG_PAGE_SIZE = 100;
const LOG_HEAD_SIZE = 50;
type LogCursor = number | null;

const FIRST_PAGE = null;

export const useSystemStatusQuery = (): UseQueryResult<SystemStatus, Error> =>
  useQuery({
    queryKey: queryKeys.systemStatus,
    queryFn: () => withFreshAccessToken(requestSystemStatus),
    refetchInterval: STATUS_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

export const useSystemLogsQuery = (
  filter: LogFilter,
): UseInfiniteQueryResult<InfiniteData<LogPage, LogCursor>, Error> =>
  useInfiniteQuery<LogPage, Error, InfiniteData<LogPage, LogCursor>, QueryKey, LogCursor>({
    queryKey: queryKeys.systemLogs(filter),
    queryFn: ({ pageParam }) =>
      withFreshAccessToken((accessToken) =>
        requestSystemLogs(filter, pageParam, LOG_PAGE_SIZE, accessToken),
      ),
    initialPageParam: FIRST_PAGE,
    getNextPageParam: (page) => page.nextBefore,
  });

export const useSystemLogHeadQuery = (filter: LogFilter): UseQueryResult<LogPage, Error> =>
  useQuery({
    queryKey: queryKeys.systemLogHead(filter),
    queryFn: () =>
      withFreshAccessToken((accessToken) =>
        requestSystemLogs(filter, FIRST_PAGE, LOG_HEAD_SIZE, accessToken),
      ),
    refetchInterval: LOG_HEAD_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
