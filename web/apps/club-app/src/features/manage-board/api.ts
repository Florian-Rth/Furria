import { useKkNotice } from '@furria/ui';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ME_QUERY_KEY } from '@/features/session';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import {
  toImpliedRoleSavedMessage,
  toOfficeArchivedMessage,
  toOfficeCreatedMessage,
  toOfficeSavedMessage,
  toSeatEndedMessage,
  toSeatOpenedMessage,
} from './manage-board-labels';
import {
  requestArchiveBoardOffice,
  requestBoard,
  requestCreateBoardOffice,
  requestEndBoardSeat,
  requestImpliedRoleOptions,
  requestOpenBoardSeat,
  requestSetImpliedRole,
  requestUpdateBoardOffice,
} from './requests';
import type {
  BoardOfficeForm,
  BoardResponse,
  CreatedBoardOffice,
  CreatedBoardSeat,
  ImpliedRoleOptions,
} from './schemas';

export const BOARD_QUERY_KEY = ['manage', 'board'] as const;
export const BOARD_ROLE_OPTIONS_QUERY_KEY = ['manage', 'board-role-options'] as const;

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

const refreshBoard = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
};

export const useBoardQuery = (): UseQueryResult<BoardResponse, Error> =>
  useQuery({
    queryKey: BOARD_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestBoard),
  });

export const useImpliedRoleOptionsQuery = (
  enabled: boolean,
): UseQueryResult<ImpliedRoleOptions, Error> =>
  useQuery({
    queryKey: BOARD_ROLE_OPTIONS_QUERY_KEY,
    queryFn: enabled ? () => withFreshAccessToken(requestImpliedRoleOptions) : skipToken,
  });

export const useCreateBoardOfficeMutation = (): UseMutationResult<
  CreatedBoardOffice,
  Error,
  BoardOfficeForm
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (form: BoardOfficeForm) =>
      withFreshAccessToken((accessToken) => requestCreateBoardOffice(form, accessToken)),
    onSuccess: (_created, form) => {
      raiseNotice({ tone: 'success', message: toOfficeCreatedMessage(form.name) });
    },
    onSettled: () => {
      refreshBoard(queryClient);
    },
  });
};

export const useUpdateBoardOfficeMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, BoardOfficeForm> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (form: BoardOfficeForm) =>
      withFreshAccessToken((accessToken) =>
        requestUpdateBoardOffice(boardOfficeId, form, accessToken),
      ),
    onSuccess: (_result, form) => {
      raiseNotice({ tone: 'success', message: toOfficeSavedMessage(form.name) });
    },
    onSettled: () => {
      refreshBoard(queryClient);
    },
  });
};

export const useArchiveBoardOfficeMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, OfficeNameInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestArchiveBoardOffice(boardOfficeId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toOfficeArchivedMessage(input.officeName) });
    },
    onSettled: () => {
      refreshBoard(queryClient);
    },
  });
};

export const useSetImpliedRoleMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, SetImpliedRoleInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
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
    onSettled: () => {
      refreshBoard(queryClient);
    },
  });
};

export const useOpenBoardSeatMutation = (
  boardOfficeId: number,
  officeName: string,
): UseMutationResult<CreatedBoardSeat, Error, OpenBoardSeatInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
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
    onSettled: () => {
      refreshBoard(queryClient);
    },
  });
};

export const useEndBoardSeatMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, EndBoardSeatInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
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
    onSettled: () => {
      refreshBoard(queryClient);
    },
  });
};
