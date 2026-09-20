import { useKkNotice } from '@furria/ui';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { MANAGE_HUB_QUERY_KEY } from '@/features/manage-hub';
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

const refreshSessions = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({ queryKey: SESSION_RECORDS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: MANAGE_HUB_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: CLUB_HUB_QUERY_KEY });
};

export const useSessionRecordsQuery = (): UseQueryResult<SessionRecordsResponse, Error> =>
  useQuery({
    queryKey: SESSION_RECORDS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestSessionRecords),
  });

export const useCreateSessionRecordMutation = (): UseMutationResult<
  CreatedSessionRecord,
  Error,
  SessionRecordPayload
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (payload: SessionRecordPayload) =>
      withFreshAccessToken((accessToken) => requestSessionRecordCreation(payload, accessToken)),
    onSuccess: (_created, payload) => {
      raiseNotice({ tone: 'success', message: toSessionCreatedMessage(payload.startYear) });
      refreshSessions(queryClient);
    },
  });
};

export const useUpdateSessionRecordMutation = (): UseMutationResult<
  void,
  Error,
  UpdateSessionRecordInput
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (input: UpdateSessionRecordInput) =>
      withFreshAccessToken((accessToken) =>
        requestSessionRecordUpdate(input.sessionId, input.payload, accessToken),
      ),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toSessionSavedMessage(input.payload.startYear) });
      refreshSessions(queryClient);
    },
  });
};

export const useRemoveSessionRecordMutation = (): UseMutationResult<
  void,
  Error,
  RemoveSessionRecordInput
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (input: RemoveSessionRecordInput) =>
      withFreshAccessToken((accessToken) =>
        requestSessionRecordRemoval(input.sessionId, accessToken),
      ),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toSessionDeletedMessage(input.startYear) });
      refreshSessions(queryClient);
    },
  });
};
