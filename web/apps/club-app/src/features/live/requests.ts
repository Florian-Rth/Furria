import { apiFetch } from '@/lib/api/api-fetch';
import type { EveningLiveResponse, LiveDirection, LiveMoveBody } from './schemas';
import { EveningLiveResponseSchema, LiveDirectionSchema } from './schemas';

const livePathOf = (calendarEntryId: number): string =>
  `/api/calendar/entries/${calendarEntryId}/live`;

export const requestEveningLive = (
  calendarEntryId: number,
  accessToken: string,
): Promise<EveningLiveResponse> =>
  apiFetch(livePathOf(calendarEntryId), { schema: EveningLiveResponseSchema, accessToken });

export const requestLiveMove = (
  calendarEntryId: number,
  body: LiveMoveBody,
  accessToken: string,
): Promise<LiveDirection> =>
  apiFetch(livePathOf(calendarEntryId), {
    method: 'PUT',
    body,
    schema: LiveDirectionSchema,
    accessToken,
  });
