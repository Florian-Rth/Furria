import { describe, expect, it } from 'vitest';
import type { OpenMarkFacts, OpenMarkKind } from './calendar-open-marks';
import { toOpenMarkKinds } from './calendar-open-marks';

describe('toOpenMarkKinds', () => {
  it.each<{ name: string; facts: OpenMarkFacts; expected: OpenMarkKind[] }>([
    {
      name: 'marks an open poll and list she has not answered',
      facts: {
        mayAnswer: true,
        openFunctions: [
          { kind: 'poll', addOnId: 1, hasAnswered: false },
          { kind: 'signUpList', addOnId: 2, hasAnswered: false },
        ],
      },
      expected: ['vote', 'signUp'],
    },
    {
      name: 'leaves out what she has answered',
      facts: {
        mayAnswer: true,
        openFunctions: [
          { kind: 'poll', addOnId: 1, hasAnswered: true },
          { kind: 'signUpList', addOnId: 2, hasAnswered: false },
        ],
      },
      expected: ['signUp'],
    },
    {
      name: 'marks two open polls once',
      facts: {
        mayAnswer: true,
        openFunctions: [
          { kind: 'poll', addOnId: 1, hasAnswered: false },
          { kind: 'poll', addOnId: 3, hasAnswered: false },
        ],
      },
      expected: ['vote'],
    },
    {
      name: 'marks nothing when she may not answer',
      facts: {
        mayAnswer: false,
        openFunctions: [{ kind: 'poll', addOnId: 1, hasAnswered: false }],
      },
      expected: [],
    },
    {
      name: 'marks nothing without open polls or lists',
      facts: {
        mayAnswer: true,
        openFunctions: [{ kind: 'daySchedule', addOnId: 4, hasAnswered: false }],
      },
      expected: [],
    },
  ])('$name', ({ facts, expected }) => {
    expect(toOpenMarkKinds(facts)).toEqual(expected);
  });
});
