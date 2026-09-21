import { describe, expect, it } from 'vitest';
import {
  toCollisionNotice,
  toDurationLabel,
  toRhythmMeta,
  toSlotFormValues,
  toSlotPayload,
  toTrainingsCreatedMessage,
  toVenueId,
} from './rhythm-labels';

describe('toDurationLabel', () => {
  it.each([
    [45, '45 Minuten'],
    [60, '1 Stunde'],
    [75, '1:15 Stunden'],
    [90, '1:30 Stunden'],
    [120, '2 Stunden'],
    [150, '2:30 Stunden'],
  ])('reads %i minutes as %s', (minutes, expected) => {
    expect(toDurationLabel(minutes)).toBe(expected);
  });
});

describe('toVenueId', () => {
  it.each([
    ['', null],
    ['7', 7],
  ])('reads %j as %j', (value, expected) => {
    expect(toVenueId(value)).toBe(expected);
  });
});

describe('toSlotFormValues', () => {
  it('cuts the seconds off a stored time', () => {
    const values = toSlotFormValues({
      groupTrainingSlotId: 3,
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

describe('toSlotPayload', () => {
  it('writes the wall clock back with seconds and reads the Ort as a number', () => {
    expect(
      toSlotPayload({
        weekday: 'tuesday',
        startsAt: '19:30',
        durationMinutes: 90,
        venueId: '7',
      }),
    ).toEqual({ weekday: 'tuesday', startsAt: '19:30:00', durationMinutes: 90, venueId: 7 });
  });

  it('keeps a slot without an Ort', () => {
    expect(
      toSlotPayload({
        weekday: 'tuesday',
        startsAt: '19:30',
        durationMinutes: 90,
        venueId: '',
      }).venueId,
    ).toBeNull();
  });
});

describe('toRhythmMeta', () => {
  it.each([
    [0, 'keine Trainingszeit'],
    [1, '1 Trainingszeit'],
    [2, '2 Trainingszeiten'],
  ])('counts %i', (count, expected) => {
    expect(toRhythmMeta(count)).toBe(expected);
  });
});

describe('toTrainingsCreatedMessage', () => {
  it.each([
    [0, 0, 'Es ist kein Termin entstanden.'],
    [0, 2, 'Es ist kein Termin entstanden. 2 Termine standen schon.'],
    [1, 0, '1 Training steht jetzt im Kalender.'],
    [3, 0, '3 Trainings stehen jetzt im Kalender.'],
    [3, 1, '3 Trainings stehen jetzt im Kalender. 1 Termin stand schon.'],
  ])('reads %i created and %i skipped', (created, skipped, expected) => {
    expect(toTrainingsCreatedMessage(created, skipped)).toBe(expected);
  });
});

describe('toCollisionNotice', () => {
  it.each([
    [0, null],
    [1, 'An einem Abend ist der Ort doppelt belegt. Sieh im Kalender nach.'],
    [2, 'An 2 Abenden ist der Ort doppelt belegt. Sieh im Kalender nach.'],
  ])('reads %i collisions', (count, expected) => {
    expect(toCollisionNotice(count)).toBe(expected);
  });
});
