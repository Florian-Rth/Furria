import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { CLUB_RECORD_SAVED_MESSAGE } from './club-record-labels';
import {
  requestClubAccessUpdate,
  requestClubContactUpdate,
  requestClubIdentityUpdate,
  requestClubRecord,
} from './requests';
import type { ClubContact, ClubIdentity, ClubRecord } from './schemas';

export const useClubRecordQuery = (): UseQueryResult<ClubRecord, Error> =>
  useQuery({
    queryKey: queryKeys.clubRecord,
    queryFn: () => withFreshAccessToken(requestClubRecord),
  });

const useClubRecordWrite = <TChange>(
  write: (change: TChange, accessToken: string) => Promise<void>,
): UseMutationResult<void, Error, TChange> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['clubRecord'] },
    mutationFn: (change: TChange) =>
      withFreshAccessToken((accessToken) => write(change, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: CLUB_RECORD_SAVED_MESSAGE });
    },
  });
};

export const useUpdateClubIdentityMutation = (): UseMutationResult<void, Error, ClubIdentity> =>
  useClubRecordWrite(requestClubIdentityUpdate);

export const useUpdateClubContactMutation = (): UseMutationResult<void, Error, ClubContact> =>
  useClubRecordWrite(requestClubContactUpdate);

export const useUpdateClubAccessMutation = (): UseMutationResult<void, Error, number> =>
  useClubRecordWrite(requestClubAccessUpdate);
