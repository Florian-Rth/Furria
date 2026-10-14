import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
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

export interface UpdateSessionRecordInput {
  sessionId: number;
  payload: SessionRecordPayload;
}

export interface RemoveSessionRecordInput {
  sessionId: number;
  startYear: number;
}

export const useSessionRecordsQuery = (
  enabled = true,
): UseQueryResult<SessionRecordsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.sessionRecords,
    queryFn: () => withFreshAccessToken(requestSessionRecords),
    enabled,
  });

export const useCreateSessionRecordMutation = (): UseMutationResult<
  CreatedSessionRecord,
  Error,
  SessionRecordPayload
> =>
  useApiMutation({
    request: requestSessionRecordCreation,
    changes: ['sessionRecord'],
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
    changes: ['sessionRecord'],
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
    changes: ['sessionRecord'],
    notice: { success: (input) => toSessionDeletedMessage(input.startYear) },
  });
