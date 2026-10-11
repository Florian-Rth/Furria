import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery } from '@tanstack/react-query';
import { ME_QUERY_KEY } from '@/features/session';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toIsoDay } from '@/lib/day';
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

export const BOARD_QUERY_KEY = ['manage', 'board'] as const;
export const BOARD_ROLE_OPTIONS_QUERY_KEY = ['manage', 'board-role-options'] as const;

const BOARD_SCOPE = [BOARD_QUERY_KEY, ME_QUERY_KEY] as const;

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

export interface SetOfficePublicationInput {
  officeName: string;
  isPublic: boolean;
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
> =>
  useApiMutation({
    request: requestCreateBoardOffice,
    invalidates: BOARD_SCOPE,
    notice: { success: (form) => toOfficeCreatedMessage(form.name) },
  });

export const useUpdateBoardOfficeMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, BoardOfficeForm> =>
  useApiMutation({
    request: (form: BoardOfficeForm, accessToken) =>
      requestUpdateBoardOffice(boardOfficeId, form, accessToken),
    invalidates: BOARD_SCOPE,
    notice: { success: (form) => toOfficeSavedMessage(form.name) },
  });

export const useArchiveBoardOfficeMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, OfficeNameInput> =>
  useApiMutation({
    request: (_input: OfficeNameInput, accessToken) =>
      requestArchiveBoardOffice(boardOfficeId, accessToken),
    invalidates: BOARD_SCOPE,
    notice: { success: (input) => toOfficeArchivedMessage(input.officeName) },
  });

export const useRestoreBoardOfficeMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, OfficeNameInput> =>
  useApiMutation({
    request: (_input: OfficeNameInput, accessToken) =>
      requestRestoreBoardOffice(boardOfficeId, accessToken),
    invalidates: BOARD_SCOPE,
    notice: { success: (input) => toOfficeRestoredMessage(input.officeName) },
  });

export const useSetImpliedRoleMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, SetImpliedRoleInput> =>
  useApiMutation({
    request: (input: SetImpliedRoleInput, accessToken) =>
      requestSetImpliedRole(boardOfficeId, input.impliedRoleId, accessToken),
    invalidates: BOARD_SCOPE,
    notice: {
      success: (input) => toImpliedRoleSavedMessage(input.officeName, input.impliedRoleName),
      failure: toWriteErrorMessage,
    },
  });

export const useSetOfficePublicationMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, SetOfficePublicationInput> =>
  useApiMutation({
    request: (input: SetOfficePublicationInput, accessToken) =>
      requestSetOfficePublication(boardOfficeId, input.isPublic, accessToken),
    optimistic: [
      optimisticPatch(BOARD_QUERY_KEY, (current: BoardResponse | undefined, input) =>
        applyPublication(current, boardOfficeId, input.isPublic),
      ),
    ],
    invalidates: [],
    notice: {
      success: (input) => toPublicationSavedMessage(input.officeName, input.isPublic),
      failure: toPublicationErrorMessage,
    },
  });

export const useOpenBoardSeatMutation = (
  boardOfficeId: number,
  officeName: string,
): UseMutationResult<CreatedBoardSeat, Error, OpenBoardSeatInput> =>
  useApiMutation({
    request: (input: OpenBoardSeatInput, accessToken) =>
      requestOpenBoardSeat(
        boardOfficeId,
        { personId: input.personId, sinceOn: input.sinceOn },
        accessToken,
      ),
    invalidates: BOARD_SCOPE,
    notice: {
      success: (input) =>
        toSeatOpenedMessage(input.personName, officeName, input.sinceOn, toIsoDay(new Date())),
    },
  });

export const useEndBoardSeatMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, EndBoardSeatInput> =>
  useApiMutation({
    request: (input: EndBoardSeatInput, accessToken) =>
      requestEndBoardSeat(
        boardOfficeId,
        { boardSeatId: input.boardSeatId, endedOn: input.endedOn },
        accessToken,
      ),
    invalidates: BOARD_SCOPE,
    notice: {
      success: (input) => toSeatEndedMessage(input.personName, input.endedOn, toIsoDay(new Date())),
    },
  });
