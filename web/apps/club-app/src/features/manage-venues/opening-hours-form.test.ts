import { describe, expect, it } from 'vitest';
import { nextOpeningSlotOf, openingSlotIssuesOf, toOpeningSlotForms } from './opening-hours-form';

describe('openingSlotIssuesOf', () => {
  it.each([
    {
      name: 'split hours on one day',
      slots: [
        { weekday: 'monday' as const, opens: '09:00', closes: '12:00' },
        { weekday: 'monday' as const, opens: '14:00', closes: '18:00' },
      ],
      expected: [],
    },
    {
      name: 'touching slots',
      slots: [
        { weekday: 'monday' as const, opens: '09:00', closes: '12:00' },
        { weekday: 'monday' as const, opens: '12:00', closes: '18:00' },
      ],
      expected: [],
    },
    {
      name: 'the same hours on different days',
      slots: [
        { weekday: 'monday' as const, opens: '09:00', closes: '18:00' },
        { weekday: 'tuesday' as const, opens: '09:00', closes: '18:00' },
      ],
      expected: [],
    },
    {
      name: 'an end before the start',
      slots: [{ weekday: 'friday' as const, opens: '18:00', closes: '09:00' }],
      expected: [{ index: 0, kind: 'reversed' }],
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
    {
      name: 'an unfinished slot',
      slots: [
        { weekday: 'monday' as const, opens: '09:00', closes: '' },
        { weekday: 'monday' as const, opens: '10:00', closes: '12:00' },
      ],
      expected: [],
    },
  ])('$name', ({ slots, expected }) => {
    expect(openingSlotIssuesOf(slots)).toEqual(expected);
  });
});

describe('nextOpeningSlotOf', () => {
  it.each([
    {
      name: 'a first slot',
      slots: [],
      expected: { weekday: 'monday', opens: '09:00', closes: '18:00' },
    },
    {
      name: 'the day after the last slot with its hours',
      slots: [{ weekday: 'tuesday' as const, opens: '08:30', closes: '12:30' }],
      expected: { weekday: 'wednesday', opens: '08:30', closes: '12:30' },
    },
    {
      name: 'Monday after Sunday',
      slots: [{ weekday: 'sunday' as const, opens: '10:00', closes: '14:00' }],
      expected: { weekday: 'monday', opens: '10:00', closes: '14:00' },
    },
  ])('$name', ({ slots, expected }) => {
    expect(nextOpeningSlotOf(slots)).toEqual(expected);
  });
});

describe('toOpeningSlotForms', () => {
  it('drops the seconds the server sends', () => {
    expect(
      toOpeningSlotForms([{ weekday: 'monday', opens: '09:00:00', closes: '18:30:00' }]),
    ).toEqual([{ weekday: 'monday', opens: '09:00', closes: '18:30' }]);
  });
});
