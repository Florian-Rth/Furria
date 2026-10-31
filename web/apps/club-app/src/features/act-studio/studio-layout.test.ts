import { describe, expect, it } from 'vitest';
import { largeTextFrameOf } from './studio-layout';

describe('largeTextFrameOf', () => {
  it.each([
    ['video', true, 'video'],
    ['video', false, 'stage'],
    ['stage', true, 'stage'],
    ['stage', false, 'stage'],
  ] as const)('a %s part with the video shown %s puts %s in the hero', (filmed, shown, hero) => {
    expect(largeTextFrameOf(filmed, shown).hero).toBe(hero);
  });
});
