import { describe, expect, it } from 'vitest';
import type { OpeningHoursLine, OpeningSlot } from './opening-hours';
import { formatOpeningHours } from './opening-hours';

describe('formatOpeningHours', () => {
  it.each<[string, OpeningSlot[], OpeningHoursLine[]]>([
    ['no slots', [], []],
    [
      'one day with full hours',
      [{ weekday: 'saturday', opens: '09:00', closes: '13:00' }],
      [{ days: 'Sa', times: '9–13' }],
    ],
    [
      'minutes and seconds from the server',
      [{ weekday: 'monday', opens: '09:30:00', closes: '18:15:00' }],
      [{ days: 'Mo', times: '9:30–18:15' }],
    ],
    [
      'split hours ordered by opening',
      [
        { weekday: 'tuesday', opens: '14:00', closes: '18:00' },
        { weekday: 'tuesday', opens: '09:00', closes: '12:00' },
      ],
      [{ days: 'Di', times: '9–12 · 14–18' }],
    ],
    [
      'a working week compressed into a range',
      (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map(
        (weekday): OpeningSlot => ({ weekday, opens: '09:00', closes: '18:00' }),
      ),
      [{ days: 'Mo–Fr', times: '9–18' }],
    ],
    [
      'two equal neighbours listed, not ranged',
      [
        { weekday: 'sunday', opens: '10:00', closes: '12:00' },
        { weekday: 'saturday', opens: '10:00', closes: '12:00' },
      ],
      [{ days: 'Sa, So', times: '10–12' }],
    ],
    [
      'equal days split by a gap stay apart',
      [
        { weekday: 'monday', opens: '09:00', closes: '12:00' },
        { weekday: 'wednesday', opens: '09:00', closes: '12:00' },
      ],
      [
        { days: 'Mo', times: '9–12' },
        { days: 'Mi', times: '9–12' },
      ],
    ],
    [
      'a different day breaks the run',
      [
        { weekday: 'monday', opens: '09:00', closes: '18:00' },
        { weekday: 'tuesday', opens: '09:00', closes: '18:00' },
        { weekday: 'wednesday', opens: '09:00', closes: '13:00' },
        { weekday: 'thursday', opens: '09:00', closes: '18:00' },
      ],
      [
        { days: 'Mo, Di', times: '9–18' },
        { days: 'Mi', times: '9–13' },
        { days: 'Do', times: '9–18' },
      ],
    ],
  ])('formats %s', (_case, slots, expected) => {
    expect(formatOpeningHours(slots)).toEqual(expected);
  });
});
