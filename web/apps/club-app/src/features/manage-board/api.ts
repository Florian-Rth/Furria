import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toIsoDay } from '@/lib/day';
import { queryKeys } from '@/lib/query/reads';
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

export const useBoardQuery = (enabled = true): UseQueryResult<BoardResponse, Error> =>
  useQuery({
    queryKey: queryKeys.board,
    queryFn: () => withFreshAccessToken(requestBoard),
    enabled,
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
> =>
  useApiMutation({
    request: requestCreateBoardOffice,
    changes: ['boardOffice'],
    notice: { success: (form) => toOfficeCreatedMessage(form.name) },
  });

export const useUpdateBoardOfficeMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, BoardOfficeForm> =>
  useApiMutation({
    request: (form: BoardOfficeForm, accessToken) =>
      requestUpdateBoardOffice(boardOfficeId, form, accessToken),
    changes: ['boardOffice'],
    notice: { success: (form) => toOfficeSavedMessage(form.name) },
  });

export const useArchiveBoardOfficeMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, OfficeNameInput> =>
  useApiMutation({
    request: (_input: OfficeNameInput, accessToken) =>
      requestArchiveBoardOffice(boardOfficeId, accessToken),
    changes: ['boardOffice'],
    notice: { success: (input) => toOfficeArchivedMessage(input.officeName) },
  });

export const useRestoreBoardOfficeMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, OfficeNameInput> =>
  useApiMutation({
    request: (_input: OfficeNameInput, accessToken) =>
      requestRestoreBoardOffice(boardOfficeId, accessToken),
    changes: ['boardOffice'],
    notice: { success: (input) => toOfficeRestoredMessage(input.officeName) },
  });

export const useSetImpliedRoleMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, SetImpliedRoleInput> =>
  useApiMutation({
    request: (input: SetImpliedRoleInput, accessToken) =>
      requestSetImpliedRole(boardOfficeId, input.impliedRoleId, accessToken),
    changes: ['boardOffice'],
    notice: {
      success: (input) => toImpliedRoleSavedMessage(input.officeName, input.impliedRoleName),
    },
  });

export const useSetOfficePublicationMutation = (
  boardOfficeId: number,
): UseMutationResult<void, Error, SetOfficePublicationInput> =>
  useApiMutation({
    request: (input: SetOfficePublicationInput, accessToken) =>
      requestSetOfficePublication(boardOfficeId, input.isPublic, accessToken),
    optimistic: [
      optimisticPatch(queryKeys.board, (current: BoardResponse | undefined, input) =>
        applyPublication(current, boardOfficeId, input.isPublic),
      ),
    ],
    changes: ['boardOffice'],
    notice: {
      success: (input) => toPublicationSavedMessage(input.officeName, input.isPublic),
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
    changes: ['boardSeat'],
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
    changes: ['boardSeat'],
    notice: {
      success: (input) => toSeatEndedMessage(input.personName, input.endedOn, toIsoDay(new Date())),
    },
  });
