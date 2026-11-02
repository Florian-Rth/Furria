import { describe, expect, it } from 'vitest';
import { entranceOf, scoreDotKindOf } from './score-formation';

describe('scoreDotKindOf', () => {
  it.each([
    [true, false, 'own'],
    [true, true, 'own'],
    [false, true, 'open'],
    [false, false, 'cast'],
  ] as const)('own %s, open %s → %s', (own, open, kind) => {
    const dot = { id: 1, x: 0.5, y: 0.5, own, open, number: 1, caption: null };

    expect(scoreDotKindOf(dot)).toBe(kind);
  });
});

describe('entranceOf', () => {
  it('enters from the earlier place after the delay', () => {
    const dot = {
      id: 1,
      x: 0.5,
      y: 0.5,
      own: false,
      open: false,
      number: 1,
      caption: null,
      fromX: 0.2,
      fromY: 0.3,
    };

    expect(entranceOf(dot, 0.4)).toEqual({ x: 0.2, y: 0.3, delay: 0.4 });
  });

  it.each([
    ['no delay', { fromX: 0.2, fromY: 0.3 }, null],
    ['no earlier place', {}, 0.4],
  ] as const)('stays put with %s', (_case, from, delay) => {
    const dot = { id: 1, x: 0.5, y: 0.5, own: false, open: false, number: 1, caption: null };

    expect(entranceOf({ ...dot, ...from }, delay)).toBeNull();
  });
});
