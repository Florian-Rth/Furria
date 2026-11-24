import { describe, expect, it } from 'vitest';
import { isVacantOn } from './manage-board-labels';
import type { BoardSeat } from './schemas';

const TODAY = '2026-09-20';

const seat = (overrides: Partial<BoardSeat> & { boardSeatId: number }): BoardSeat => ({
  personId: 1,
  firstName: 'Ilka',
  lastName: 'Reineke',
  sinceOn: '2016-11-11',
  untilOn: null,
  honours: { sessions: 0, functions: [] },
  ...overrides,
});

describe('isVacantOn', () => {
  it.each([
    {
      scenario: 'the only seat starts tomorrow',
      seats: [seat({ boardSeatId: 1, sinceOn: '2026-09-21' })],
      expected: true,
    },
    {
      scenario: 'the seat ends today',
      seats: [seat({ boardSeatId: 1, untilOn: TODAY })],
      expected: false,
    },
    {
      scenario: 'the seat ended yesterday',
      seats: [seat({ boardSeatId: 1, untilOn: '2026-09-19' })],
      expected: true,
    },
  ])('is $expected when $scenario', ({ seats, expected }) => {
    expect(isVacantOn(seats, TODAY)).toBe(expected);
  });
});
