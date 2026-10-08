import { apiFetch } from '@/lib/api/api-fetch';
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
