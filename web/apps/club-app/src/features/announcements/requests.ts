import type { AttendanceAnswer } from '@/features/attendance/schemas';
import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { AnnouncementPayload } from './announcement-add-ons';
import type {
  AnnouncementMentionables,
  AnnouncementsResponse,
  CreatedAnnouncement,
} from './schemas';
import {
  AnnouncementMentionablesSchema,
  AnnouncementsResponseSchema,
  CreatedAnnouncementSchema,
} from './schemas';

export const requestAnnouncements = (accessToken: string): Promise<AnnouncementsResponse> =>
  apiFetch('/api/announcements', { schema: AnnouncementsResponseSchema, accessToken });

export const requestAnnouncementMentionables = (
  accessToken: string,
): Promise<AnnouncementMentionables> =>
  apiFetch('/api/announcements/mentionables', {
    schema: AnnouncementMentionablesSchema,
    accessToken,
  });

const toAnnouncementBody = (payload: AnnouncementPayload): AnnouncementPayload => ({
  title: payload.title,
  body: payload.body,
  validUntil: payload.validUntil,
  addOns: payload.addOns,
});

export const requestCreateAnnouncement = (
  payload: AnnouncementPayload,
  accessToken: string,
): Promise<CreatedAnnouncement> =>
  apiFetch('/api/announcements', {
    method: 'POST',
    body: toAnnouncementBody(payload),
    schema: CreatedAnnouncementSchema,
    accessToken,
  });

export const requestUpdateAnnouncement = (
  announcementId: number,
  payload: AnnouncementPayload,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/announcements/${announcementId}`, {
    method: 'PUT',
    body: toAnnouncementBody(payload),
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

export const requestAnnouncementAnswer = (
  announcementId: number,
  answer: AttendanceAnswer,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/announcements/${announcementId}/response`, {
    method: 'POST',
    body: { answer },
    schema: NoContentSchema,
    accessToken,
  });

export const requestAnnouncementAttendanceClosing = (
  announcementId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/announcements/${announcementId}/attendance/close`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });
