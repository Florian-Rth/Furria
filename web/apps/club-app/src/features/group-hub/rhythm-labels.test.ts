import { describe, expect, it } from 'vitest';
import {
  toCollisionNotice,
  toDurationLabel,
  toHeldVenue,
  toRhythmMeta,
  toRhythmVenueOptions,
  toSlotFormValues,
  toSlotPayload,
  toSlotVenueLine,
  toTrainingsCreatedMessage,
  toUnavailableVenueIds,
  toVenueId,
} from './rhythm-labels';
import type { TrainingSlot } from './schemas';

const slot = (
  groupTrainingSlotId: number,
  venueId: number | null,
  venueName: string | null,
): TrainingSlot => ({
  groupTrainingSlotId,
  weekday: 'tuesday',
  startsAt: '17:00:00',
  durationMinutes: 60,
  venueId,
  venueName,
});

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
  it('writes the wall clock back with seconds and reads the venue as a number', () => {
    expect(
      toSlotPayload({
        weekday: 'tuesday',
        startsAt: '19:30',
        durationMinutes: 90,
        venueId: '7',
      }),
    ).toEqual({ weekday: 'tuesday', startsAt: '19:30:00', durationMinutes: 90, venueId: 7 });
  });

  it('keeps a slot without a venue', () => {
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
    [0, 0, 'Es wurde kein Termin angelegt.'],
    [0, 2, 'Es wurde kein Termin angelegt. 2 Termine waren bereits vorhanden.'],
    [1, 0, '1 Training ist angelegt.'],
    [3, 0, '3 Trainings sind angelegt.'],
    [3, 1, '3 Trainings sind angelegt. 1 Termin war bereits vorhanden.'],
  ])('reads %i created and %i skipped', (created, skipped, expected) => {
    expect(toTrainingsCreatedMessage(created, skipped)).toBe(expected);
  });
});

describe('toCollisionNotice', () => {
  it.each([
    [0, null],
    [1, 'An einem Termin ist der Ort doppelt belegt.'],
    [2, 'An 2 Terminen ist der Ort doppelt belegt.'],
  ])('reads %i collisions', (count, expected) => {
    expect(toCollisionNotice(count)).toBe(expected);
  });
});

describe('toRhythmVenueOptions', () => {
  const running = [
    { venueId: 1, name: 'Sporthalle' },
    { venueId: 2, name: 'Vereinsraum' },
  ];

  it('leads with the no-venue choice and offers what runs', () => {
    expect(toRhythmVenueOptions(running, null).map((option) => option.value)).toEqual([
      '',
      '1',
      '2',
    ]);
  });

  it('keeps the held venue choosable after it was archived', () => {
    const options = toRhythmVenueOptions(running, { venueId: 9, name: 'Lager' });

    expect(options.at(-1)).toEqual({ value: '9', label: 'Lager — archiviert' });
  });

  it('adds nothing when the held venue still runs', () => {
    expect(toRhythmVenueOptions(running, { venueId: 1, name: 'Sporthalle' })).toHaveLength(3);
  });

  it('calls the held venue nothing while the venue list is missing', () => {
    expect(toRhythmVenueOptions(null, { venueId: 9, name: 'Lager' }).at(-1)).toEqual({
      value: '9',
      label: 'Lager',
    });
  });
});

describe('toHeldVenue', () => {
  it.each([
    [null, null],
    [slot(1, null, null), null],
  ])('reads %o as nothing held', (held, expected) => {
    expect(toHeldVenue(held)).toBe(expected);
  });

  it('pairs the id with the name the training slot carries', () => {
    expect(toHeldVenue(slot(1, 9, 'Lager'))).toEqual({ venueId: 9, name: 'Lager' });
  });
});

describe('toUnavailableVenueIds', () => {
  it('names the venues no longer in the venue list', () => {
    const slots = [slot(1, 9, 'Lager'), slot(2, 1, 'Sporthalle'), slot(3, null, null)];

    expect([...toUnavailableVenueIds(slots, [{ venueId: 1, name: 'Sporthalle' }])]).toEqual([9]);
  });

  it('accuses nothing while the venue list is missing', () => {
    expect(toUnavailableVenueIds([slot(1, 9, 'Lager')], null).size).toBe(0);
  });
});

describe('toSlotVenueLine', () => {
  it.each([
    [null, false, 'Ohne Ort'],
    ['Sporthalle', false, 'Sporthalle'],
    ['Lager', true, 'Lager — archiviert'],
  ])('writes %s as %s', (venueName, isArchived, expected) => {
    expect(toSlotVenueLine(venueName, isArchived)).toBe(expected);
  });
});
