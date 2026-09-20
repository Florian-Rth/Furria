import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { CreatedKeyHolding, KeyHoldingsResponse } from './schemas';
import { CreatedKeyHoldingSchema, KeyHoldingsResponseSchema } from './schemas';

export interface KeyHandoutBody {
  venueId: number;
  personId: number;
  sinceOn: string;
}

export const requestKeyHoldings = (accessToken: string): Promise<KeyHoldingsResponse> =>
  apiFetch('/api/manage/keys', { schema: KeyHoldingsResponseSchema, accessToken });

export const requestKeyHandout = (
  body: KeyHandoutBody,
  accessToken: string,
): Promise<CreatedKeyHolding> =>
  apiFetch('/api/manage/keys', {
    method: 'POST',
    body: { venueId: body.venueId, personId: body.personId, sinceOn: body.sinceOn },
    schema: CreatedKeyHoldingSchema,
    accessToken,
  });

export const requestKeyReturn = (
  keyHoldingId: number,
  untilOn: string,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/keys/${keyHoldingId}/end`, {
    method: 'POST',
    body: { untilOn },
    schema: NoContentSchema,
    accessToken,
  });
