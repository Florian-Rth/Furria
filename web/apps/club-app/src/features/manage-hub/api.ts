import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { ToDoMarkSurface } from '@/features/to-dos/api';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { withManageToDoMark } from './manage-to-dos';
import { requestManageHub } from './requests';
import type { ManageHub } from './schemas';

export const useManageHubQuery = (): UseQueryResult<ManageHub, Error> =>
  useQuery({
    queryKey: queryKeys.manageHub,
    queryFn: () => withFreshAccessToken(requestManageHub),
  });

export const MANAGE_TO_DO_SURFACE: ToDoMarkSurface<ManageHub> = {
  queryKey: queryKeys.manageHub,
  withMark: withManageToDoMark,
};
