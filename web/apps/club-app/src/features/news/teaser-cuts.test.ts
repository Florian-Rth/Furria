import { describe, expect, it } from 'vitest';
import type { TeaserSurfaceFit } from './teaser-cuts';
import { greyFromOf, lineCutOf, teaserCutsOf } from './teaser-cuts';

const perCharacter = (text: string): number => text.length * 10;

const fit = (
  width: number,
  lines: number,
): Pick<TeaserSurfaceFit, 'variant' | 'width' | 'lines'> => ({
  variant: 'body2',
  width,
  lines,
});

describe('lineCutOf', () => {
  it.each([
    ['fits on one line', 'aaa bbb', fit(100, 1), null],
    ['wraps within the line budget', 'aaa bbb ccc', fit(70, 2), null],
    ['cuts where the next line would start', 'aaa bbb ccc ddd', fit(70, 1), 8],
    ['cuts after the last allowed line', 'aaa bbb ccc ddd eee', fit(70, 2), 16],
    ['never breaks a single overlong word', 'aaaaaaaaaaaa', fit(30, 1), null],
  ])('%s', (_, text, surface, expected) => {
    expect(lineCutOf(text, surface, perCharacter)).toBe(expected);
  });
});

describe('teaserCutsOf', () => {
  it('lists the cuts in reading order', () => {
    const surfaces: TeaserSurfaceFit[] = [
      { surface: 'lead', variant: 'body1', width: 70, lines: 2 },
      { surface: 'card', variant: 'body2', width: 70, lines: 1 },
    ];

    expect(teaserCutsOf('aaa bbb ccc ddd eee', surfaces, perCharacter)).toEqual([
      { surface: 'card', index: 8 },
      { surface: 'lead', index: 16 },
    ]);
  });
});

describe('greyFromOf', () => {
  it.each([
    ['no cut', [], 2, null],
    ['only some surfaces cut', [{ surface: 'card' as const, index: 8 }], 2, null],
    [
      'every surface cuts',
      [
        { surface: 'card' as const, index: 8 },
        { surface: 'lead' as const, index: 16 },
      ],
      2,
      16,
    ],
  ])('%s', (_, cuts, surfaceCount, expected) => {
    expect(greyFromOf(cuts, surfaceCount)).toBe(expected);
  });
});
