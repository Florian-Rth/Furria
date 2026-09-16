import { describe, expect, it } from 'vitest';
import type { KkScreenMove } from '../../screen-move';
import { screenEntranceOf } from './screen-entrance';

const MOVES: KkScreenMove[] = ['lateral-forward', 'lateral-back', 'deeper', 'shallower'];

describe('screenEntranceOf', () => {
  it('lets a screen that did not change stay exactly where it is', () => {
    const entrance = screenEntranceOf('still', false);

    expect(entrance.from).toEqual(entrance.to);
    expect(entrance.transition).toEqual({ duration: 0 });
  });

  it.each(MOVES)('arrives out of sight on a %s move', (move) => {
    expect(screenEntranceOf(move, false).from.opacity).toBe(0);
  });

  it.each(MOVES)('settles in place after a %s move', (move) => {
    expect(screenEntranceOf(move, false).to).toEqual({ opacity: 1, x: 0, scale: 1 });
  });

  it('enters from the trailing edge going right and from the leading edge coming back', () => {
    const forward = screenEntranceOf('lateral-forward', false).from.x;
    const back = screenEntranceOf('lateral-back', false).from.x;

    expect(forward).toBeGreaterThan(0);
    expect(back).toBe(-Number(forward));
  });

  it('mirrors a drill-down when the same step is walked back', () => {
    const deeper = screenEntranceOf('deeper', false).from;
    const shallower = screenEntranceOf('shallower', false).from;

    expect(shallower.x).toBe(-Number(deeper.x));
    expect(Number(deeper.scale)).toBeLessThan(1);
    expect(Number(shallower.scale)).toBeGreaterThan(1);
  });

  it.each(MOVES)('travels further on a drill-down than sideways, for %s', (move) => {
    const lateral = Math.abs(Number(screenEntranceOf('lateral-forward', false).from.x));
    const travelled = Math.abs(Number(screenEntranceOf(move, false).from.x));

    expect(travelled).toBeGreaterThanOrEqual(lateral);
  });

  it.each(MOVES)('fades in place under reduced motion, for %s', (move) => {
    const entrance = screenEntranceOf(move, true);

    expect(entrance.from).toEqual({ opacity: 0, x: 0, scale: 1 });
  });

  it('stays still under reduced motion when nothing moved', () => {
    expect(screenEntranceOf('still', true).transition).toEqual({ duration: 0 });
  });
});
