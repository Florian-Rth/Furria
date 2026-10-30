import { describe, expect, it } from 'vitest';
import { largeTextFrameOf, practiceFrameOf } from './studio-layout';

describe('practiceFrameOf', () => {
  it.each([
    ['video', { hero: 'video', side: 'stage' }],
    ['stage', { hero: 'stage', side: 'note' }],
  ] as const)('a %s part', (filmed, frame) => {
    expect(practiceFrameOf(filmed)).toEqual(frame);
  });
});

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
