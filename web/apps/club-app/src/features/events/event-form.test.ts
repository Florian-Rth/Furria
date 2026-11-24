import { describe, expect, it } from 'vitest';
import { toEventPayload } from './event-form';
import type { EventForm } from './schemas';

const at = (year: number, month: number, day: number, hour: number, minute = 0): string =>
  new Date(year, month - 1, day, hour, minute).toISOString();

const form = (overrides: Partial<EventForm>): EventForm => ({
  title: ' 1. Prunksitzung ',
  startDay: '2027-01-16',
  startTime: '19:15',
  doorsOpenAt: '',
  venueId: '2',
  teaser: ' Der Abend der Session. ',
  description: '  ',
  ageHint: '',
  price: '',
  presaleDay: '',
  presaleTime: '10:00',
  presaleVenueIds: [],
  ...overrides,
});

describe('toEventPayload', () => {
  it('carries the doors, the price and the presale start', () => {
    const payload = toEventPayload(
      form({
        doorsOpenAt: '18:00',
        price: '22,50',
        presaleDay: '2026-12-01',
        presaleTime: '10:00',
        ageHint: ' ab 16 ',
      }),
    );

    expect(payload.doorsOpenAt).toBe('18:00:00');
    expect(payload.priceCents).toBe(2_250);
    expect(payload.presaleStartsAt).toBe(at(2026, 12, 1, 10));
    expect(payload.ageHint).toBe('ab 16');
  });
});
