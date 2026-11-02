import { describe, expect, it } from 'vitest';
import { inWeekOrder, toWeekRhythm } from './week-rhythm';

const usualTime = (
  usualTrainingTimeId: number,
  weekday: 'monday' | 'tuesday' | 'friday',
  startsAt: string,
) => ({
  usualTrainingTimeId,
  weekday,
  startsAt,
  durationMinutes: 90,
  venueId: null,
  venueName: null,
});

describe('toWeekRhythm', () => {
  it('lays out a full week from Monday, empty when nothing is usual', () => {
    const rhythm = toWeekRhythm([]);

    expect(rhythm.map((day) => day.weekday)).toEqual([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]);
    expect(rhythm.every((day) => day.times.length === 0)).toBe(true);
  });

  it('puts each start on its weekday, earliest first, without duplicates', () => {
    const rhythm = toWeekRhythm([
      usualTime(1, 'tuesday', '19:30:00'),
      usualTime(2, 'friday', '18:00:00'),
      usualTime(3, 'tuesday', '17:00:00'),
      usualTime(4, 'tuesday', '19:30:00'),
    ]);

    expect(rhythm.map((day) => day.times)).toEqual([
      [],
      ['17:00', '19:30'],
      [],
      [],
      ['18:00'],
      [],
      [],
    ]);
  });
});

describe('inWeekOrder', () => {
  it('orders by weekday from Monday, then by start', () => {
    const ordered = inWeekOrder([
      usualTime(1, 'friday', '17:00:00'),
      usualTime(2, 'tuesday', '19:30:00'),
      usualTime(3, 'monday', '18:00:00'),
      usualTime(4, 'tuesday', '17:00:00'),
    ]);

    expect(ordered.map((entry) => entry.usualTrainingTimeId)).toEqual([3, 4, 2, 1]);
  });
});
