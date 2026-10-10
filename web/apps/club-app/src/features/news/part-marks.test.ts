import { describe, expect, it } from 'vitest';
import { partMarkOf } from './part-marks';

describe('partMarkOf', () => {
  it.each([
    ['a flagged requirement wins over a change', 'title', ['title'], ['title'], 'missing'],
    ['a changed part', 'picture', [], ['picture'], 'changed'],
    ['an untouched part', 'album', ['title'], ['picture'], null],
  ] as const)('%s', (_, part, flagged, changed, expected) => {
    expect(partMarkOf(part, flagged, changed)).toBe(expected);
  });
});
