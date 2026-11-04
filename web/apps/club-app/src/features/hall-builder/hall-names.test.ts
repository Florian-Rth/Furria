import { describe, expect, it } from 'vitest';
import { nextHallName } from './hall-names';

describe('nextHallName', () => {
  it.each([
    { taken: [], expected: 'Saal' },
    { taken: ['Turnhalle ganz'], expected: 'Saal' },
    { taken: ['Saal'], expected: 'Saal 2' },
    { taken: [' saal ', 'Saal 2'], expected: 'Saal 3' },
    { taken: ['Saal', 'Saal 3'], expected: 'Saal 2' },
  ])('picks a free name for $taken', ({ taken, expected }) => {
    expect(nextHallName(taken)).toBe(expected);
  });
});
