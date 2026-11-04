import { describe, expect, it } from 'vitest';
import { hallBuilderOriginOf } from './hall-builder-origin';

describe('hallBuilderOriginOf', () => {
  it.each([
    {
      facts: { eventId: 4, venueId: 2, venueName: 'Turnhalle', canOpenVenue: true },
      to: '/events/$eventId/tischplan',
    },
    {
      facts: { eventId: undefined, venueId: 2, venueName: 'Turnhalle', canOpenVenue: true },
      to: '/manage/venues/$venueId',
    },
    {
      facts: { eventId: undefined, venueId: 2, venueName: 'Turnhalle', canOpenVenue: false },
      to: '/events',
    },
    {
      facts: { eventId: undefined, venueId: null, venueName: null, canOpenVenue: true },
      to: '/events',
    },
  ])('leads back to $to', ({ facts, to }) => {
    expect(hallBuilderOriginOf(facts).to).toBe(to);
  });
});
