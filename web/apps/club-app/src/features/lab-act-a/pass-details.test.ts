import { describe, expect, it } from 'vitest';
import type { Studio } from '@/features/acts/schemas';
import { scheduleCountsOf } from './pass-details';

const appearance = (position: number | null) => ({
  appearanceId: 1,
  position,
  stageStartsAt: null,
  added: [],
  removedPersonIds: [],
  spotChanges: [],
  choreography: null,
});

describe('scheduleCountsOf', () => {
  it('counts placed and joined evenings, trainings and open spots', () => {
    const studio: Studio = {
      music: { lengthSeconds: 0, source: 'workingMix' },
      songs: [],
      finalTracks: [],
      steps: [],
      parts: [],
      spots: [],
      videos: [],
      choreography: null,
      stage: null,
      evenings: [
        {
          eventId: 1,
          title: 'A',
          startsAt: '2026-11-11T10:11:00+00:00',
          appearance: appearance(2),
        },
        {
          eventId: 2,
          title: 'B',
          startsAt: '2027-01-23T19:11:00+00:00',
          appearance: appearance(null),
        },
        { eventId: 3, title: 'C', startsAt: '2027-02-04T18:11:00+00:00', appearance: null },
      ],
      trainings: [
        {
          calendarEntryId: 1,
          title: 'Training',
          startsAt: '2026-11-03T18:00:00+00:00',
          openSpotIds: [4, 5],
          responses: [],
        },
        {
          calendarEntryId: 2,
          title: 'Training',
          startsAt: '2026-11-05T18:00:00+00:00',
          openSpotIds: [],
          responses: [],
        },
      ],
    };

    expect(scheduleCountsOf(studio)).toEqual({ placed: 1, joined: 1, trainings: 2, openSpots: 2 });
  });
});
