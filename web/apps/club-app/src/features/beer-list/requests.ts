import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { BeerGivers, BeerTab, BookedBeerCrates, OpenBeerPotResponse } from './schemas';
import {
  BeerGiversSchema,
  BeerTabSchema,
  BookedBeerCratesSchema,
  OpenBeerPotResponseSchema,
} from './schemas';

export const requestOpenBeerPot = (accessToken: string): Promise<OpenBeerPotResponse> =>
  apiFetch('/api/beer-list/pot', { schema: OpenBeerPotResponseSchema, accessToken });

export const requestMyBeerTab = (accessToken: string): Promise<BeerTab> =>
  apiFetch('/api/beer-list/tab', { schema: BeerTabSchema, accessToken });

export const requestBeerGivers = (accessToken: string): Promise<BeerGivers> =>
  apiFetch('/api/beer-list/givers', { schema: BeerGiversSchema, accessToken });

export const requestBeerCratesBooking = (
  count: number,
  accessToken: string,
): Promise<BookedBeerCrates> =>
  apiFetch('/api/beer-list/crates', {
    method: 'POST',
    body: { count },
    schema: BookedBeerCratesSchema,
    accessToken,
  });

export const requestBeerCratesUndo = (
  crateIds: readonly number[],
  accessToken: string,
): Promise<void> =>
  apiFetch('/api/beer-list/crates/undo', {
    method: 'POST',
    body: { crateIds: [...crateIds] },
    schema: NoContentSchema,
    accessToken,
  });
