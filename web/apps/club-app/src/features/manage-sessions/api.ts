import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
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

export const useSessionRecordsQuery = (): UseQueryResult<SessionRecordsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.sessionRecords,
    queryFn: () => withFreshAccessToken(requestSessionRecords),
  });

export const useCreateSessionRecordMutation = (): UseMutationResult<
  CreatedSessionRecord,
  Error,
  SessionRecordPayload
> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['sessionRecord'] },
    mutationFn: (payload: SessionRecordPayload) =>
      withFreshAccessToken((accessToken) => requestSessionRecordCreation(payload, accessToken)),
    onSuccess: (_created, payload) => {
      raiseNotice({ tone: 'success', message: toSessionCreatedMessage(payload.startYear) });
    },
  });
};

export const useUpdateSessionRecordMutation = (): UseMutationResult<
  void,
  Error,
  UpdateSessionRecordInput
> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['sessionRecord'] },
    mutationFn: (input: UpdateSessionRecordInput) =>
      withFreshAccessToken((accessToken) =>
        requestSessionRecordUpdate(input.sessionId, input.payload, accessToken),
      ),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toSessionSavedMessage(input.payload.startYear) });
    },
  });
};

export const useRemoveSessionRecordMutation = (): UseMutationResult<
  void,
  Error,
  RemoveSessionRecordInput
> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['sessionRecord'] },
    mutationFn: (input: RemoveSessionRecordInput) =>
      withFreshAccessToken((accessToken) =>
        requestSessionRecordRemoval(input.sessionId, accessToken),
      ),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toSessionDeletedMessage(input.startYear) });
    },
  });
};
