import { describe, expect, it } from 'vitest';
import { screenEntranceOf } from './screen-entrance';

describe('screenEntranceOf', () => {
  it.each([false, true])('lets an unchanged screen stay put with reduced motion %s', (reduced) => {
    const entrance = screenEntranceOf('still', reduced);

    expect(entrance.from).toEqual(entrance.to);
    expect(entrance.transition).toEqual({ duration: 0 });
  });

  it('fades in place under reduced motion', () => {
    expect(screenEntranceOf('deeper', true).from).toEqual({ opacity: 0, x: 0, scale: 1 });
  });

  it('travels in from out of sight while motion is welcome', () => {
    const { from } = screenEntranceOf('lateral-back', false);

    expect(from.opacity).toBe(0);
    expect(Number(from.x)).toBeLessThan(0);
  });
});
