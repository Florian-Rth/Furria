import { describe, expect, it } from 'vitest';
import { parsePositiveId } from './positive-id';

describe('parsePositiveId', () => {
  it.each([
    { label: 'a positive id', raw: '42', expected: 42 },
    { label: 'nothing', raw: undefined, expected: null },
    { label: 'an empty segment', raw: '', expected: null },
    { label: 'zero', raw: '0', expected: null },
    { label: 'a negative number', raw: '-3', expected: null },
    { label: 'a leading zero', raw: '007', expected: null },
    { label: 'a fraction', raw: '1.5', expected: null },
    { label: 'trailing text', raw: '12abc', expected: null },
    { label: 'surrounding whitespace', raw: ' 12', expected: null },
  ])('reads $label as $expected', ({ raw, expected }) => {
    expect(parsePositiveId(raw)).toBe(expected);
  });
});
