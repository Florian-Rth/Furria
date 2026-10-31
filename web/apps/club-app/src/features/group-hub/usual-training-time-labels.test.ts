import { describe, expect, it } from 'vitest';
import type { UsualTrainingTime } from './schemas';
import type { DurationParts, HeldVenueState } from './usual-training-time-labels';
import {
  durationPartsOf,
  heldVenueStateOf,
  toUnavailableVenueIds,
  toUsualTimeFormValues,
  toUsualTimePayload,
  toUsualTimesVenueOptions,
} from './usual-training-time-labels';

const usualTime = (
  usualTrainingTimeId: number,
  venueId: number | null,
  venueName: string | null,
): UsualTrainingTime => ({
  usualTrainingTimeId,
  weekday: 'tuesday',
  startsAt: '17:00:00',
  durationMinutes: 60,
  venueId,
  venueName,
});

describe('durationPartsOf', () => {
  it.each<[number, DurationParts]>([
    [45, { kind: 'minutes', minutes: 45 }],
    [60, { kind: 'hours', hours: 1 }],
    [120, { kind: 'hours', hours: 2 }],
    [150, { kind: 'hoursAndMinutes', hours: 2, minutes: 30 }],
  ])('splits %i minutes', (minutes, expected) => {
    expect(durationPartsOf(minutes)).toEqual(expected);
  });
});

describe('toUsualTimeFormValues', () => {
  it('cuts the seconds off a stored time', () => {
    const values = toUsualTimeFormValues({
      usualTrainingTimeId: 3,
      weekday: 'thursday',
      startsAt: '18:45:00',
      durationMinutes: 75,
      venueId: 7,
      venueName: 'Sporthalle',
    });

    expect(values).toEqual({
      weekday: 'thursday',
      startsAt: '18:45',
      durationMinutes: 75,
      venueId: '7',
    });
  });
});

describe('toUsualTimePayload', () => {
  it.each([
    ['7', 7],
    ['', null],
  ])(
    'writes the wall clock back with seconds and reads the venue %j as %j',
    (venueId, expected) => {
      expect(
        toUsualTimePayload({ weekday: 'tuesday', startsAt: '19:30', durationMinutes: 90, venueId }),
      ).toEqual({
        weekday: 'tuesday',
        startsAt: '19:30:00',
        durationMinutes: 90,
        venueId: expected,
      });
    },
  );
});

describe('heldVenueStateOf', () => {
  const running = [
    { venueId: 1, name: 'Sporthalle' },
    { venueId: 2, name: 'Vereinsraum' },
  ];

  it.each<[string, typeof running | null, HeldVenueState]>([
    ['a venue that still runs', running, 'offered'],
    ['a venue that was archived', [{ venueId: 2, name: 'Vereinsraum' }], 'archived'],
    ['a venue while the venue list is missing', null, 'unlisted'],
  ])('reads %s', (_case, venues, expected) => {
    expect(heldVenueStateOf(venues, { venueId: 1, name: 'Sporthalle' })).toBe(expected);
  });
});

describe('toUsualTimesVenueOptions', () => {
  const running = [
    { venueId: 1, name: 'Sporthalle' },
    { venueId: 2, name: 'Vereinsraum' },
  ];

  it.each([
    ['nothing held', null, ['', '1', '2']],
    ['a held venue that still runs', { venueId: 1, name: 'Sporthalle' }, ['', '1', '2']],
    ['a held venue that was archived', { venueId: 9, name: 'Lager' }, ['', '1', '2', '9']],
  ])('leads with the no-venue choice for %s', (_case, held, expected) => {
    expect(toUsualTimesVenueOptions(running, held).map((option) => option.value)).toEqual(expected);
  });
});

describe('toUnavailableVenueIds', () => {
  it('names the venues no longer in the venue list', () => {
    const usualTimes = [
      usualTime(1, 9, 'Lager'),
      usualTime(2, 1, 'Sporthalle'),
      usualTime(3, null, null),
    ];

    expect([...toUnavailableVenueIds(usualTimes, [{ venueId: 1, name: 'Sporthalle' }])]).toEqual([
      9,
    ]);
  });

  it('accuses nothing while the venue list is missing', () => {
    expect(toUnavailableVenueIds([usualTime(1, 9, 'Lager')], null).size).toBe(0);
  });
});
