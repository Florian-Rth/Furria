import { describe, expect, it } from 'vitest';
import { largeTextFrameOf, studioFrameOf } from './studio-layout';

describe('studioFrameOf', () => {
  it.each([
    [false, 'music', 'video', { hero: 'video', side: 'stage', strip: 'segments' }],
    [false, 'music', 'stage', { hero: 'stage', side: 'note', strip: 'segments' }],
    [true, 'music', 'video', { hero: 'wave', side: 'songs', strip: 'segments' }],
    [true, 'steps', 'video', { hero: 'video', side: 'rail', strip: 'marks' }],
    [true, 'formation', 'video', { hero: 'editor', side: 'cast', strip: 'segments' }],
    [true, 'movement', 'stage', { hero: 'editor', side: 'cast', strip: 'counts' }],
    [true, 'video', 'stage', { hero: 'stage', side: 'takes', strip: 'placement' }],
  ] as const)('editing %s with %s over %s', (editing, tool, filmed, frame) => {
    expect(studioFrameOf(editing, tool, filmed)).toEqual(frame);
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
