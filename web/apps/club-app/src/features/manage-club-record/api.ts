import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
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

export const useClubRecordQuery = (enabled = true): UseQueryResult<ClubRecord, Error> =>
  useQuery({
    queryKey: queryKeys.clubRecord,
    queryFn: () => withFreshAccessToken(requestClubRecord),
    enabled,
  });

const useClubRecordWrite = <TChange>(
  request: (change: TChange, accessToken: string) => Promise<void>,
): UseMutationResult<void, Error, TChange> =>
  useApiMutation({
    request,
    changes: ['clubRecord'],
    notice: { success: () => CLUB_RECORD_SAVED_MESSAGE },
  });

export const useUpdateClubIdentityMutation = (): UseMutationResult<void, Error, ClubIdentity> =>
  useClubRecordWrite(requestClubIdentityUpdate);

export const useUpdateClubContactMutation = (): UseMutationResult<void, Error, ClubContact> =>
  useClubRecordWrite(requestClubContactUpdate);

export const useUpdateClubAccessMutation = (): UseMutationResult<void, Error, number> =>
  useClubRecordWrite(requestClubAccessUpdate);
