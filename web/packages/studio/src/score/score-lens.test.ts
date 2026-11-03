import { scoreLensesOf, scoreLensOf, WHOLE_LENS } from '@furria/studio/score-lens';
import type { TimelinePart } from '@furria/studio/Timeline';
import { describe, expect, it } from 'vitest';

const parts: TimelinePart[] = [
  { key: 10, label: 'Intro', range: { start: 0, end: 8 }, shade: 0 },
  { key: 11, label: 'Finale', range: null, shade: 1 },
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
