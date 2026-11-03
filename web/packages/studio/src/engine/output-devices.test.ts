import { describe, expect, it } from 'vitest';
import { outputLostOf } from './output-devices';

describe('outputLostOf', () => {
  it.each<[string, string[], string[], boolean]>([
    ['headphones plugged in', ['speaker'], ['speaker', 'headphones'], false],
    ['the same outputs again', ['speaker', 'headphones'], ['headphones', 'speaker'], false],
    ['headphones pulled out', ['speaker', 'headphones'], ['speaker'], true],
    ['bluetooth swapped for another device', ['speaker', 'car'], ['speaker', 'buds'], true],
    ['one of two unnamed outputs gone', ['', ''], [''], true],
    ['a browser that lists no outputs', [], [], true],
  ])('%s', (_, before, after, lost) => {
    expect(outputLostOf(before, after)).toBe(lost);
  });
});
