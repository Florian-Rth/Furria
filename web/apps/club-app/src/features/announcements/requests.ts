import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { AnnouncementForm, AnnouncementsResponse, CreatedAnnouncement } from './schemas';
import { AnnouncementsResponseSchema, CreatedAnnouncementSchema } from './schemas';

export const requestAnnouncements = (accessToken: string): Promise<AnnouncementsResponse> =>
  apiFetch('/api/announcements', { schema: AnnouncementsResponseSchema, accessToken });

export const requestCreateAnnouncement = (
  form: AnnouncementForm,
  accessToken: string,
): Promise<CreatedAnnouncement> =>
  apiFetch('/api/announcements', {
    method: 'POST',
    body: { title: form.title, body: form.body, validUntil: form.validUntil },
    schema: CreatedAnnouncementSchema,
    accessToken,
  });

export const requestUpdateAnnouncement = (
  announcementId: number,
  form: AnnouncementForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/announcements/${announcementId}`, {
    method: 'PUT',
    body: { title: form.title, body: form.body, validUntil: form.validUntil },
    schema: NoContentSchema,
    accessToken,
  });

export const requestWithdrawAnnouncement = (
  announcementId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/announcements/${announcementId}/withdraw`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestLastSeenAnnouncement = (
  seenUpTo: string | null,
  accessToken: string,
): Promise<void> =>
  apiFetch('/api/auth/me/last-seen-announcement', {
    method: 'PUT',
    body: { seenUpTo },
    schema: NoContentSchema,
    accessToken,
  });
