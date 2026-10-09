import { describe, expect, it } from 'vitest';
import type { CullFrame, CullIntent, CullState, CullVerdict } from './light-table';
import { cull, openCount, startCulling, verdictCount, verdictOf } from './light-table';

const FRAMES: CullFrame[] = [
  { id: 1, scene: 1 },
  { id: 2, scene: 1 },
  { id: 3, scene: 1 },
  { id: 4, scene: 2 },
  { id: 5, scene: 2 },
];

const run = (...intents: CullIntent[]): CullState => intents.reduce(cull, startCulling(FRAMES));

const verdictsOf = (state: CullState): CullVerdict['kind'][] =>
  FRAMES.map((frame) => verdictOf(state, frame.id).kind);

const REJECT: CullIntent = { kind: 'reject', wholeScene: false };
const FILE_TWO: CullIntent = { kind: 'file', slot: 2, wholeScene: false };

describe('cull', () => {
  it.each<[string, CullIntent[], CullVerdict['kind'][], number]>([
    [
      'a reject marks the frame and moves on',
      [REJECT],
      ['rejected', 'open', 'open', 'open', 'open'],
      1,
    ],
    [
      'filing marks the frame and moves on',
      [FILE_TWO],
      ['filed', 'open', 'open', 'open', 'open'],
      1,
    ],
    [
      'the cursor skips frames already decided',
      [{ kind: 'jump', id: 2 }, REJECT, { kind: 'jump', id: 1 }, REJECT],
      ['rejected', 'rejected', 'open', 'open', 'open'],
      2,
    ],
    [
      'a whole-scene reject stays pending until confirmed',
      [{ kind: 'reject', wholeScene: true }],
      ['open', 'open', 'open', 'open', 'open'],
      0,
    ],
    [
      'confirming a whole-scene reject decides only its open frames',
      [FILE_TWO, { kind: 'reject', wholeScene: true }, { kind: 'confirm' }],
      ['filed', 'rejected', 'rejected', 'open', 'open'],
      3,
    ],
    [
      'a cancelled scene verdict decides nothing',
      [{ kind: 'reject', wholeScene: true }, { kind: 'cancel' }, { kind: 'confirm' }],
      ['open', 'open', 'open', 'open', 'open'],
      0,
    ],
    [
      'undo restores the frames and the cursor',
      [REJECT, FILE_TWO, { kind: 'undo' }],
      ['rejected', 'open', 'open', 'open', 'open'],
      1,
    ],
    [
      'undo takes back a whole scene at once',
      [{ kind: 'reject', wholeScene: true }, { kind: 'confirm' }, { kind: 'undo' }],
      ['open', 'open', 'open', 'open', 'open'],
      0,
    ],
    [
      'undo without history changes nothing',
      [{ kind: 'undo' }],
      ['open', 'open', 'open', 'open', 'open'],
      0,
    ],
    [
      'a decided frame cannot be decided again',
      [REJECT, { kind: 'step', delta: -1 }, FILE_TWO],
      ['rejected', 'open', 'open', 'open', 'open'],
      0,
    ],
    [
      'stepping stops at the last frame',
      [{ kind: 'step', delta: 9 }],
      ['open', 'open', 'open', 'open', 'open'],
      4,
    ],
    [
      'stepping stops at the first frame',
      [{ kind: 'step', delta: -3 }],
      ['open', 'open', 'open', 'open', 'open'],
      0,
    ],
    [
      'after the last frame the cursor wraps to the first open one',
      [{ kind: 'jump', id: 5 }, REJECT],
      ['open', 'open', 'open', 'open', 'rejected'],
      0,
    ],
  ])('%s', (_, intents, verdicts, cursor) => {
    const state = run(...intents);

    expect({ verdicts: verdictsOf(state), cursor: state.cursor }).toEqual({ verdicts, cursor });
  });
});

describe('tallies', () => {
  const state = run(
    REJECT,
    FILE_TWO,
    { kind: 'file', slot: 1, wholeScene: false },
    { kind: 'file', slot: 2, wholeScene: false },
  );

  it.each<[string, number, number]>([
    ['open', openCount(state), 1],
    ['rejected', verdictCount(state, 'rejected'), 1],
    ['filed', verdictCount(state, 'filed'), 3],
    ['filed into slot 2', verdictCount(state, 'filed', 2), 2],
  ])('%s', (_, actual, expected) => {
    expect(actual).toBe(expected);
  });
});
