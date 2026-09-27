import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MANAGE_HUB_QUERY_KEY } from '@/features/manage-hub';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { CLUB_RECORD_SAVED_MESSAGE } from './club-record-labels';
import {
  requestClubAccessUpdate,
  requestClubContactUpdate,
  requestClubIdentityUpdate,
  requestClubRecord,
} from './requests';
import type { ClubContact, ClubIdentity, ClubRecord } from './schemas';

export const CLUB_RECORD_QUERY_KEY = ['manage', 'club-record'] as const;

export const useClubRecordQuery = (): UseQueryResult<ClubRecord, Error> =>
  useQuery({
    queryKey: CLUB_RECORD_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestClubRecord),
  });

const useClubRecordWrite = <TChange>(
  write: (change: TChange, accessToken: string) => Promise<void>,
): UseMutationResult<void, Error, TChange> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (change: TChange) =>
      withFreshAccessToken((accessToken) => write(change, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: CLUB_RECORD_SAVED_MESSAGE });
      void queryClient.invalidateQueries({ queryKey: CLUB_RECORD_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: MANAGE_HUB_QUERY_KEY });
    },
  });
};

export const useUpdateClubIdentityMutation = (): UseMutationResult<void, Error, ClubIdentity> =>
  useClubRecordWrite(requestClubIdentityUpdate);

export const useUpdateClubContactMutation = (): UseMutationResult<void, Error, ClubContact> =>
  useClubRecordWrite(requestClubContactUpdate);

export const useUpdateClubAccessMutation = (): UseMutationResult<void, Error, number> =>
  useClubRecordWrite(requestClubAccessUpdate);
