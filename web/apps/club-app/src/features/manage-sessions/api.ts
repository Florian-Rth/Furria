import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { MANAGE_HUB_QUERY_KEY } from '@/features/manage-hub';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import {
  toSessionCreatedMessage,
  toSessionDeletedMessage,
  toSessionSavedMessage,
} from './manage-sessions-labels';
import {
  requestSessionRecordCreation,
  requestSessionRecordRemoval,
  requestSessionRecords,
  requestSessionRecordUpdate,
} from './requests';
import type { CreatedSessionRecord, SessionRecordsResponse } from './schemas';
import type { SessionRecordPayload } from './session-record-payload';

export const SESSION_RECORDS_QUERY_KEY = ['manage', 'sessions'] as const;

export interface UpdateSessionRecordInput {
  sessionId: number;
  payload: SessionRecordPayload;
}

export interface RemoveSessionRecordInput {
  sessionId: number;
  startYear: number;
}

const SESSIONS_SCOPE = [
  SESSION_RECORDS_QUERY_KEY,
  MANAGE_HUB_QUERY_KEY,
  CLUB_HUB_QUERY_KEY,
] as const;

export const useSessionRecordsQuery = (): UseQueryResult<SessionRecordsResponse, Error> =>
  useQuery({
    queryKey: SESSION_RECORDS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestSessionRecords),
  });

export const useCreateSessionRecordMutation = (): UseMutationResult<
  CreatedSessionRecord,
  Error,
  SessionRecordPayload
> =>
  useApiMutation({
    request: requestSessionRecordCreation,
    invalidates: SESSIONS_SCOPE,
    notice: { success: (payload) => toSessionCreatedMessage(payload.startYear) },
  });

export const useUpdateSessionRecordMutation = (): UseMutationResult<
  void,
  Error,
  UpdateSessionRecordInput
> =>
  useApiMutation({
    request: (input: UpdateSessionRecordInput, accessToken) =>
      requestSessionRecordUpdate(input.sessionId, input.payload, accessToken),
    invalidates: SESSIONS_SCOPE,
    notice: { success: (input) => toSessionSavedMessage(input.payload.startYear) },
  });

export const useRemoveSessionRecordMutation = (): UseMutationResult<
  void,
  Error,
  RemoveSessionRecordInput
> =>
  useApiMutation({
    request: (input: RemoveSessionRecordInput, accessToken) =>
      requestSessionRecordRemoval(input.sessionId, accessToken),
    invalidates: SESSIONS_SCOPE,
    notice: { success: (input) => toSessionDeletedMessage(input.startYear) },
  });
