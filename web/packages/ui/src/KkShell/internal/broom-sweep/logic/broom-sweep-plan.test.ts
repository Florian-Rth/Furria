import { describe, expect, it } from 'vitest';
import type { KkScreenMove } from '../../../screen-move';
import type { KkBarSnapshot } from '../../logic/bar-scene';
import type { BroomSweepPlan } from './broom-sweep-plan';
import { planBroomSweep } from './broom-sweep-plan';

const home: KkBarSnapshot = {
  path: '/',
  kind: 'overview',
  lead: 'brand',
  title: 'h',
  origin: null,
};
const nested: KkBarSnapshot = {
  path: '/manage',
  kind: 'detail',
  lead: 'brand',
  title: 'n',
  origin: { label: 'o', to: '/more' },
};
const sheet: KkBarSnapshot = {
  path: '/calendar/new',
  kind: 'fullscreen',
  lead: 'title',
  title: 's',
  origin: { label: 'c', to: '/calendar' },
};
const bare: KkBarSnapshot = { ...nested, lead: 'title', title: 'b' };

describe('planBroomSweep', () => {
  it.each<{
    previous: KkBarSnapshot;
    current: KkBarSnapshot;
    move: KkScreenMove;
    scrollOffset: number;
    expected: Partial<BroomSweepPlan>;
  }>([
    {
      previous: home,
      current: nested,
      move: 'deeper',
      scrollOffset: 0,
      expected: { direction: 'forward', shift: 'fold', from: 'broom' },
    },
    {
      previous: nested,
      current: home,
      move: 'shallower',
      scrollOffset: 0,
      expected: {
        direction: 'backward',
        shift: 'unfold',
        from: 'back',
        ghost: { text: 'o', wordmark: false },
      },
    },
    {
      previous: nested,
      current: nested,
      move: 'lateral-forward',
      scrollOffset: 10_000,
      expected: { direction: 'forward', shift: 'flick', ghost: { text: 'n', wordmark: false } },
    },
    {
      previous: sheet,
      current: home,
      move: 'lateral-back',
      scrollOffset: 0,
      expected: {
        direction: 'backward',
        shift: 'spin',
        from: 'close',
        ghost: { text: 's', wordmark: false },
      },
    },
    {
      previous: bare,
      current: sheet,
      move: 'deeper',
      scrollOffset: 0,
      expected: { shift: 'spin', ghost: { text: 'b', wordmark: false } },
    },
    {
      previous: home,
      current: home,
      move: 'still',
      scrollOffset: 10_000,
      expected: { shift: 'flick', ghost: { text: 'h', wordmark: false } },
    },
  ])(
    'plans $move from $previous.path to $current.path at $scrollOffset',
    ({ previous, current, move, scrollOffset, expected }) => {
      expect(
        planBroomSweep({ previous, current, move, scrollOffset, motion: 'ramped' }),
      ).toMatchObject(expected);
    },
  );

  it('shows the wordmark as the ghost of an unscrolled home bar', () => {
    const plan = planBroomSweep({
      previous: home,
      current: nested,
      move: 'deeper',
      scrollOffset: 0,
      motion: 'ramped',
    });

    expect(plan.ghost.wordmark).toBe(true);
  });
});
