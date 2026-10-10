import { describe, expect, it } from 'vitest';
import type { PressLineInput } from './press-bar-facts';
import { pressLineOf, readinessSlotsOf, shownStageOf, showsReadiness } from './press-bar-facts';

const WORDS = { category: 'c', title: 't', teaser: 'v', text: 'x' };

const settled: PressLineInput = {
  stage: 'draft',
  save: 'saved',
  savedAt: '2026-10-10T09:00:00Z',
  publishedAt: null,
  withdrawnAt: null,
  missing: [],
  isBusy: false,
  showsLive: false,
  isCompact: false,
};

describe('readinessSlotsOf', () => {
  it('inks every met requirement in a fixed order', () => {
    expect(
      readinessSlotsOf(['teaser', 'category'], WORDS).map((slot) => [slot.id, slot.done]),
    ).toEqual([
      ['category', false],
      ['title', true],
      ['teaser', false],
      ['text', true],
    ]);
  });
});

describe('pressLineOf', () => {
  it.each([
    ['a running press', { isBusy: true, save: 'saving' }, 'publishing'],
    ['a save in flight', { save: 'saving' }, 'saving'],
    ['a failed save', { save: 'failed', showsLive: true }, 'failed'],
    ['the live version on screen', { stage: 'pending', showsLive: true }, 'viewOnly'],
    ['a draft with gaps on a phone', { missing: ['title'], isCompact: true }, 'missing'],
    ['a draft with gaps on a desktop', { missing: ['title'] }, 'saved'],
    [
      'a live post',
      { stage: 'live', publishedAt: '2026-10-01T10:00:00Z', missing: ['text'], isCompact: true },
      'liveSince',
    ],
    [
      'a withdrawn post',
      { stage: 'withdrawn', withdrawnAt: '2026-10-02T10:00:00Z' },
      'withdrawnAt',
    ],
    ['pending changes', { stage: 'pending', publishedAt: '2026-10-01T10:00:00Z' }, 'saved'],
  ] as const)('%s', (_, overrides, expected) => {
    expect(pressLineOf({ ...settled, ...overrides }).kind).toBe(expected);
  });
});

describe('shownStageOf', () => {
  it.each([
    ['holds the draft while the first publication runs', 'live', 'first', true, 'draft'],
    ['holds pending changes while they run', 'live', 'changes', true, 'pending'],
    ['holds the withdrawn state while republishing', 'live', 'republish', true, 'withdrawn'],
    ['shows the stage once the press settled', 'live', 'first', false, 'live'],
  ] as const)('%s', (_, stage, kind, isBusy, expected) => {
    expect(shownStageOf(stage, kind, isBusy)).toBe(expected);
  });
});

describe('showsReadiness', () => {
  it.each([
    ['a draft with gaps', 'draft', 2, true],
    ['a complete draft', 'draft', 0, false],
    ['a live post', 'live', 1, false],
    ['pending changes with gaps', 'pending', 1, true],
  ] as const)('%s', (_, stage, missingCount, expected) => {
    expect(showsReadiness(stage, missingCount)).toBe(expected);
  });
});
