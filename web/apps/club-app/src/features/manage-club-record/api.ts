import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { MANAGE_HUB_QUERY_KEY } from '@/features/manage-hub';
import { useApiMutation } from '@/lib/api/api-mutation';
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
  request: (change: TChange, accessToken: string) => Promise<void>,
): UseMutationResult<void, Error, TChange> =>
  useApiMutation({
    request,
    invalidates: [CLUB_RECORD_QUERY_KEY, MANAGE_HUB_QUERY_KEY],
    notice: { success: () => CLUB_RECORD_SAVED_MESSAGE },
  });

export const useUpdateClubIdentityMutation = (): UseMutationResult<void, Error, ClubIdentity> =>
  useClubRecordWrite(requestClubIdentityUpdate);

export const useUpdateClubContactMutation = (): UseMutationResult<void, Error, ClubContact> =>
  useClubRecordWrite(requestClubContactUpdate);

export const useUpdateClubAccessMutation = (): UseMutationResult<void, Error, number> =>
  useClubRecordWrite(requestClubAccessUpdate);
