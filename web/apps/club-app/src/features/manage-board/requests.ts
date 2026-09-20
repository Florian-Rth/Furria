import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type {
  BoardOfficeForm,
  BoardResponse,
  CreatedBoardOffice,
  CreatedBoardSeat,
  EndBoardSeatForm,
  ImpliedRoleOptions,
  OpenBoardSeatForm,
} from './schemas';
import {
  BoardResponseSchema,
  CreatedBoardOfficeSchema,
  CreatedBoardSeatSchema,
  ImpliedRoleOptionsSchema,
} from './schemas';

export const requestBoard = (accessToken: string): Promise<BoardResponse> =>
  apiFetch('/api/manage/board', { schema: BoardResponseSchema, accessToken });

export const requestImpliedRoleOptions = (accessToken: string): Promise<ImpliedRoleOptions> =>
  apiFetch('/api/manage/roles', { schema: ImpliedRoleOptionsSchema, accessToken });

export const requestCreateBoardOffice = (
  form: BoardOfficeForm,
  accessToken: string,
): Promise<CreatedBoardOffice> =>
  apiFetch('/api/manage/board/offices', {
    method: 'POST',
    body: { name: form.name, sortOrder: Number(form.sortOrder) },
    schema: CreatedBoardOfficeSchema,
    accessToken,
  });

export const requestUpdateBoardOffice = (
  boardOfficeId: number,
  form: BoardOfficeForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/board/offices/${boardOfficeId}`, {
    method: 'PUT',
    body: { name: form.name, sortOrder: Number(form.sortOrder) },
    schema: NoContentSchema,
    accessToken,
  });

export const requestArchiveBoardOffice = (
  boardOfficeId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/board/offices/${boardOfficeId}/archive`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestSetImpliedRole = (
  boardOfficeId: number,
  impliedRoleId: number | null,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/board/offices/${boardOfficeId}/implied-role`, {
    method: 'PUT',
    body: { impliedRoleId },
    schema: NoContentSchema,
    accessToken,
  });

export const requestOpenBoardSeat = (
  boardOfficeId: number,
  form: OpenBoardSeatForm,
  accessToken: string,
): Promise<CreatedBoardSeat> =>
  apiFetch(`/api/manage/board/offices/${boardOfficeId}/seats`, {
    method: 'POST',
    body: { personId: form.personId, sinceOn: form.sinceOn },
    schema: CreatedBoardSeatSchema,
    accessToken,
  });

export const requestEndBoardSeat = (
  boardOfficeId: number,
  form: EndBoardSeatForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/board/offices/${boardOfficeId}/seats/${form.boardSeatId}/end`, {
    method: 'POST',
    body: { endedOn: form.endedOn },
    schema: NoContentSchema,
    accessToken,
  });
