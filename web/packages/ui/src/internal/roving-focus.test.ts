import { describe, expect, it } from 'vitest';
import { nextRovingId } from './roving-focus';

const ids = ['a', 'b', 'c'];

describe('nextRovingId', () => {
  it.each([
    { key: 'ArrowDown', from: 'a', expected: 'b' },
    { key: 'ArrowUp', from: 'b', expected: 'a' },
    { key: 'Home', from: 'c', expected: 'a' },
    { key: 'End', from: 'a', expected: 'c' },
    { key: 'ArrowRight', from: 'c', expected: 'a' },
    { key: 'ArrowLeft', from: 'a', expected: 'c' },
    { key: 'ArrowRight', from: undefined, expected: 'b' },
    { key: 'ArrowLeft', from: undefined, expected: 'c' },
    { key: 'ArrowRight', from: 'gone', expected: 'b' },
    { key: 'Enter', from: 'a', expected: null },
  ])('moves from $from to $expected on $key', ({ key, from, expected }) => {
    expect(nextRovingId(ids, from, key)).toBe(expected);
  });

  it('answers nothing when the set is empty', () => {
    expect(nextRovingId([], undefined, 'Home')).toBeNull();
  });
});
