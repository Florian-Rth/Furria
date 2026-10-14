import { describe, expect, it } from 'vitest';
import type { PickListPhase } from './pick-list';
import { pickListPhaseOf } from './pick-list';

describe('pickListPhaseOf', () => {
  it.each<{
    label: string;
    count: number | undefined;
    error: Error | null;
    phase: PickListPhase;
  }>([
    { label: 'nothing arrived yet', count: undefined, error: null, phase: 'loading' },
    { label: 'the first load failed', count: undefined, error: new Error('down'), phase: 'failed' },
    { label: 'the list arrived empty', count: 0, error: null, phase: 'empty' },
    { label: 'the list arrived filled', count: 3, error: null, phase: 'ready' },
    {
      label: 'a refetch failed over a shown list',
      count: 3,
      error: new Error('down'),
      phase: 'ready',
    },
    {
      label: 'a refetch failed over an empty list',
      count: 0,
      error: new Error('down'),
      phase: 'empty',
    },
  ])('is $phase when $label', ({ count, error, phase }) => {
    expect(pickListPhaseOf(count, error)).toBe(phase);
  });
});
