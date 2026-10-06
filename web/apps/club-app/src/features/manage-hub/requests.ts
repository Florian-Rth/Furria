import type { ToDoKind } from '@/features/to-dos';
import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { InvitationRoundPreview, InvitationRoundSent, ManageHub } from './schemas';
import {
  InvitationRoundPreviewSchema,
  InvitationRoundSentSchema,
  ManageHubSchema,
} from './schemas';

export const requestManageHub = (accessToken: string): Promise<ManageHub> =>
  apiFetch('/api/manage/hub', { schema: ManageHubSchema, accessToken });

export const requestInvitationRoundPreview = (
  accessToken: string,
): Promise<InvitationRoundPreview> =>
  apiFetch('/api/manage/invitations/preview', {
    schema: InvitationRoundPreviewSchema,
    accessToken,
  });

export const requestBulkInvitation = (accessToken: string): Promise<InvitationRoundSent> =>
  apiFetch('/api/manage/invitations/bulk', {
    method: 'POST',
    schema: InvitationRoundSentSchema,
    accessToken,
  });

export const requestInvitationReminders = (accessToken: string): Promise<InvitationRoundSent> =>
  apiFetch('/api/manage/invitations/reminders', {
    method: 'POST',
    schema: InvitationRoundSentSchema,
    accessToken,
  });

const toDoSeenPath = (kind: ToDoKind): string => `/api/to-dos/${kind}/seen`;

export const requestToDoSeen = (
  kind: ToDoKind,
  version: string,
  accessToken: string,
): Promise<void> =>
  apiFetch(toDoSeenPath(kind), {
    method: 'PUT',
    body: { version },
    schema: NoContentSchema,
    accessToken,
  });

export const requestToDoUnseen = (kind: ToDoKind, accessToken: string): Promise<void> =>
  apiFetch(toDoSeenPath(kind), { method: 'DELETE', schema: NoContentSchema, accessToken });
