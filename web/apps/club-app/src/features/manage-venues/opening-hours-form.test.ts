import { describe, expect, it } from 'vitest';
import { openingSlotIssuesOf } from './opening-hours-form';

describe('openingSlotIssuesOf', () => {
  it.each([
    {
      name: 'touching slots',
      slots: [
        { weekday: 'monday' as const, opens: '09:00', closes: '12:00' },
        { weekday: 'monday' as const, opens: '12:00', closes: '18:00' },
      ],
      expected: [],
    },
    {
      name: 'an end equal to the start',
      slots: [{ weekday: 'friday' as const, opens: '09:00', closes: '09:00' }],
      expected: [{ index: 0, kind: 'reversed' }],
    },
    {
      name: 'an overlap marks the later slot',
      slots: [
        { weekday: 'saturday' as const, opens: '09:00', closes: '13:00' },
        { weekday: 'sunday' as const, opens: '10:00', closes: '12:00' },
        { weekday: 'saturday' as const, opens: '12:00', closes: '15:00' },
      ],
      expected: [{ index: 2, kind: 'overlap' }],
    },
    {
      name: 'a reversed slot does not count as an overlap',
      slots: [
        { weekday: 'monday' as const, opens: '18:00', closes: '08:00' },
        { weekday: 'monday' as const, opens: '09:00', closes: '12:00' },
      ],
      expected: [{ index: 0, kind: 'reversed' }],
    },
  ])('$name', ({ slots, expected }) => {
    expect(openingSlotIssuesOf(slots)).toEqual(expected);
  });
});
