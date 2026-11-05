import type { WriteLanding } from '@/features/write/landing-target';
import { HUB_PATH } from './beer-hub-copy';

export const HUB_LANDING: WriteLanding = { to: HUB_PATH };

export const personLandingOf = (personId: number): WriteLanding => ({
  to: '/beer-list/manage/persons/$personId',
  params: { personId },
});

const BEER_BOOKING_PATH = '/beer-list/book';

export const beerBookingUrlOf = (origin: string): string => `${origin}${BEER_BOOKING_PATH}`;

export const closedPotPathOf = (beerPotId: number): string => `/beer-list/manage/pots/${beerPotId}`;

export const closedPotLandingOf = (beerPotId: number): WriteLanding => ({
  to: '/beer-list/manage/pots/$beerPotId',
  params: { beerPotId },
});
