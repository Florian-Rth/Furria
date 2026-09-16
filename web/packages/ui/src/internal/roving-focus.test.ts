import { describe, expect, it } from 'vitest';
import { nextRovingId } from './roving-focus';

const ids = ['a', 'b', 'c'];

describe('nextRovingId', () => {
  it.each([
    { key: 'ArrowRight', from: 'a', expected: 'b' },
    { key: 'ArrowDown', from: 'a', expected: 'b' },
    { key: 'ArrowLeft', from: 'b', expected: 'a' },
    { key: 'ArrowUp', from: 'b', expected: 'a' },
    { key: 'Home', from: 'c', expected: 'a' },
    { key: 'End', from: 'a', expected: 'c' },
  ])('moves from $from to $expected on $key', ({ key, from, expected }) => {
    expect(nextRovingId(ids, from, key)).toBe(expected);
  });

  it.each([
    { key: 'ArrowRight', from: 'c', expected: 'a' },
    { key: 'ArrowLeft', from: 'a', expected: 'c' },
  ])('wraps around the set on $key', ({ key, from, expected }) => {
    expect(nextRovingId(ids, from, key)).toBe(expected);
  });

  it('starts at the first entry when nothing is active yet', () => {
    expect(nextRovingId(ids, undefined, 'ArrowRight')).toBe('b');
    expect(nextRovingId(ids, undefined, 'ArrowLeft')).toBe('c');
  });

  it('starts at the first entry when the active id left the set', () => {
    expect(nextRovingId(ids, 'gone', 'ArrowRight')).toBe('b');
  });

  it.each(['Enter', ' ', 'Tab', 'a', 'PageDown'])('answers nothing for %s', (key) => {
    expect(nextRovingId(ids, 'a', key)).toBeNull();
  });

  it('answers nothing when the set is empty', () => {
    expect(nextRovingId([], undefined, 'ArrowRight')).toBeNull();
    expect(nextRovingId([], undefined, 'Home')).toBeNull();
  });

  it('stays put when the set holds a single entry', () => {
    expect(nextRovingId(['only'], 'only', 'ArrowRight')).toBe('only');
    expect(nextRovingId(['only'], 'only', 'ArrowLeft')).toBe('only');
  });
});
