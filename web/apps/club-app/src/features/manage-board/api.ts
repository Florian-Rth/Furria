import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toIsoDay } from '@/lib/day';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import {
  toImpliedRoleSavedMessage,
  toOfficeArchivedMessage,
  toOfficeCreatedMessage,
  toOfficeRestoredMessage,
  toOfficeSavedMessage,
  toPublicationSavedMessage,
  toSeatEndedMessage,
  toSeatOpenedMessage,
} from './manage-board-labels';
import { toPublicationErrorMessage } from './manage-board-messages';
import {
  requestArchiveBoardOffice,
  requestBoard,
  requestCreateBoardOffice,
  requestEndBoardSeat,
  requestImpliedRoleOptions,
  requestOpenBoardSeat,
  requestRestoreBoardOffice,
  requestSetImpliedRole,
  requestSetOfficePublication,
  requestUpdateBoardOffice,
} from './requests';
import type {
  BoardOfficeForm,
  BoardResponse,
  CreatedBoardOffice,
  CreatedBoardSeat,
  ImpliedRoleOptions,
} from './schemas';

export interface OfficeNameInput {
  officeName: string;
}

export interface SetImpliedRoleInput {
  officeName: string;
  impliedRoleId: number | null;
  impliedRoleName: string | null;
}

export interface OpenBoardSeatInput {
  personId: number;
  personName: string;
  sinceOn: string;
}

export interface EndBoardSeatInput {
  boardSeatId: number;
  personName: string;
  endedOn: string;
}

export const useBoardQuery = (): UseQueryResult<BoardResponse, Error> =>
  useQuery({
    queryKey: queryKeys.board,
    queryFn: () => withFreshAccessToken(requestBoard),
  });

export const useImpliedRoleOptionsQuery = (
  enabled: boolean,
): UseQueryResult<ImpliedRoleOptions, Error> =>
  useQuery({
    queryKey: queryKeys.boardRoleOptions,
    queryFn: enabled ? () => withFreshAccessToken(requestImpliedRoleOptions) : skipToken,
  });

export const useCreateBoardOfficeMutation = (): UseMutationResult<
  CreatedBoardOffice,
  Error,
  BoardOfficeForm
> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['boardOffice'] },
    mutationFn: (form: BoardOfficeForm) =>
      withFreshAccessToken((accessToken) => requestCreateBoardOffice(form, accessToken)),
    onSuccess: (_created, form) => {
      raiseNotice({ tone: 'success', message: toOfficeCreatedMessage(form.name) });
    },
  });
};

export const useUpdateBoardOfficeMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, BoardOfficeForm> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['boardOffice'] },
    mutationFn: (form: BoardOfficeForm) =>
      withFreshAccessToken((accessToken) =>
        requestUpdateBoardOffice(boardOfficeId, form, accessToken),
      ),
    onSuccess: (_result, form) => {
      raiseNotice({ tone: 'success', message: toOfficeSavedMessage(form.name) });
    },
  });
};

export const useArchiveBoardOfficeMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, OfficeNameInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['boardOffice'] },
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestArchiveBoardOffice(boardOfficeId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toOfficeArchivedMessage(input.officeName) });
    },
  });
};

export const useRestoreBoardOfficeMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, OfficeNameInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['boardOffice'] },
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestRestoreBoardOffice(boardOfficeId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toOfficeRestoredMessage(input.officeName) });
    },
  });
};

export const useSetImpliedRoleMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, SetImpliedRoleInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['boardOffice'] },
    mutationFn: (input: SetImpliedRoleInput) =>
      withFreshAccessToken((accessToken) =>
        requestSetImpliedRole(boardOfficeId, input.impliedRoleId, accessToken),
      ),
    onSuccess: (_result, input) => {
      const message = toImpliedRoleSavedMessage(input.officeName, input.impliedRoleName);

      raiseNotice({ tone: 'success', message });
    },
    onError: (error) => {
      const message = toWriteErrorMessage(error);

      if (message !== null) {
        raiseNotice({ tone: 'error', message });
      }
    },
  });
};

export interface SetOfficePublicationInput {
  officeName: string;
  isPublic: boolean;
}

interface BoardRollback {
  previous: BoardResponse | undefined;
}

const applyPublication = (
  current: BoardResponse | undefined,
  boardOfficeId: number,
  isPublic: boolean,
): BoardResponse | undefined =>
  current === undefined
    ? undefined
    : {
        offices: current.offices.map((office) =>
          office.boardOfficeId === boardOfficeId ? { ...office, isPublic } : office,
        ),
      };

export const useSetOfficePublicationMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, SetOfficePublicationInput, BoardRollback> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['boardOffice'] },
    mutationFn: (input: SetOfficePublicationInput) =>
      withFreshAccessToken((accessToken) =>
        requestSetOfficePublication(boardOfficeId, input.isPublic, accessToken),
      ),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board });
      const previous = queryClient.getQueryData<BoardResponse>(queryKeys.board);
      queryClient.setQueryData<BoardResponse>(queryKeys.board, (current) =>
        applyPublication(current, boardOfficeId, input.isPublic),
      );

      return { previous };
    },
    onSuccess: (_result, input) => {
      raiseNotice({
        tone: 'success',
        message: toPublicationSavedMessage(input.officeName, input.isPublic),
      });
    },
    onError: (error, _input, context) => {
      queryClient.setQueryData(queryKeys.board, context?.previous);
      const message = toPublicationErrorMessage(error);

      if (message !== null) {
        raiseNotice({ tone: 'error', message });
      }
    },
  });
};

export const useOpenBoardSeatMutation = (
  boardOfficeId: number,
  officeName: string,
): UseMutationResult<CreatedBoardSeat, Error, OpenBoardSeatInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['boardSeat'] },
    mutationFn: (input: OpenBoardSeatInput) =>
      withFreshAccessToken((accessToken) =>
        requestOpenBoardSeat(
          boardOfficeId,
          { personId: input.personId, sinceOn: input.sinceOn },
          accessToken,
        ),
      ),
    onSuccess: (_created, input) => {
      const message = toSeatOpenedMessage(
        input.personName,
        officeName,
        input.sinceOn,
        toIsoDay(new Date()),
      );

      raiseNotice({ tone: 'success', message });
    },
  });
};

export const useEndBoardSeatMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, EndBoardSeatInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['boardSeat'] },
    mutationFn: (input: EndBoardSeatInput) =>
      withFreshAccessToken((accessToken) =>
        requestEndBoardSeat(
          boardOfficeId,
          { boardSeatId: input.boardSeatId, endedOn: input.endedOn },
          accessToken,
        ),
      ),
    onSuccess: (_result, input) => {
      const message = toSeatEndedMessage(input.personName, input.endedOn, toIsoDay(new Date()));

      raiseNotice({ tone: 'success', message });
    },
  });
};
