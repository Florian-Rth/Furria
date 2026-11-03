import { scoreLensesOf, scoreLensOf, WHOLE_LENS } from '@furria/studio/score-lens';
import type { ScorePart } from '@furria/studio/score-steps';
import { describe, expect, it } from 'vitest';

const parts: ScorePart[] = [
  { partId: 10, index: 0, name: 'Intro', range: { start: 0, end: 8 }, stepIds: [] },
  { partId: 11, index: 1, name: 'Finale', range: null, stepIds: [] },
];

describe('scoreLensOf', () => {
  it.each([
    ['10', { lens: '10', focus: { start: 0, end: 8 } }],
    ['11', { lens: WHOLE_LENS, focus: null }],
    ['12', { lens: WHOLE_LENS, focus: null }],
    [WHOLE_LENS, { lens: WHOLE_LENS, focus: null }],
  ])('picks lens %s as the part with a range or the whole', (picked, expected) => {
    expect(scoreLensOf(parts, picked)).toEqual(expected);
  });
});

describe('scoreLensesOf', () => {
  it('offers the whole and every part with a range', () => {
    expect(scoreLensesOf(parts).map((lens) => lens.id)).toEqual([WHOLE_LENS, '10']);
  });
});
