import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { CreatedSessionRecord, SessionRecordsResponse } from './schemas';
import { CreatedSessionRecordSchema, SessionRecordsResponseSchema } from './schemas';
import type { SessionRecordPayload } from './session-record-payload';

const toBody = (payload: SessionRecordPayload): Record<string, string | number | null> => ({
  startYear: payload.startYear,
  number: payload.number,
  motto: payload.motto,
  logoSvg: payload.logoSvg,
});

export const requestSessionRecords = (accessToken: string): Promise<SessionRecordsResponse> =>
  apiFetch('/api/manage/sessions', { schema: SessionRecordsResponseSchema, accessToken });

export const requestSessionRecordCreation = (
  payload: SessionRecordPayload,
  accessToken: string,
): Promise<CreatedSessionRecord> =>
  apiFetch('/api/manage/sessions', {
    method: 'POST',
    body: toBody(payload),
    schema: CreatedSessionRecordSchema,
    accessToken,
  });

export const requestSessionRecordUpdate = (
  sessionId: number,
  payload: SessionRecordPayload,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/sessions/${sessionId}`, {
    method: 'PUT',
    body: toBody(payload),
    schema: NoContentSchema,
    accessToken,
  });

export const requestSessionRecordRemoval = (
  sessionId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/sessions/${sessionId}`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });
