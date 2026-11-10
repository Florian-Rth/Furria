import { describe, expect, it } from 'vitest';
import {
  areTonesAlike,
  eventToneOf,
  GROUP_TONE_PRESETS,
  groupToneRecipe,
  isToneTaken,
} from './group-tone';
import { contrastOf, oklchOf } from './tone-color';

const LIGHT_PAGE = '#F1F2F4';
const DARK_PANEL = '#1F232A';
const TEXT_FLOOR = 4.5;
const EDGE_FLOOR = 3;
const FREE_PICKS = [
  '#FFEB3B',
  '#00FFFF',
  '#FF0000',
  '#000080',
  '#808080',
  '#FFFFFF',
  '#000000',
  '#12AB9C',
];

describe('eventToneOf', () => {
  it.each([
    [1, '#676C1D'],
    [10, '#A0522B'],
    [23, '#207823'],
  ])('gives event %i the same tone on every surface', (eventId, tone) => {
    expect(eventToneOf(eventId)).toBe(tone);
  });
});

describe('groupToneRecipe', () => {
  it.each(FREE_PICKS)('keeps white text readable on a field of %s in both schemes', (tone) => {
    const recipe = groupToneRecipe(tone);

    expect(contrastOf(recipe.fieldLight, '#FFFFFF')).toBeGreaterThanOrEqual(TEXT_FLOOR);
    expect(contrastOf(recipe.fieldDark, '#F4F6F8')).toBeGreaterThanOrEqual(TEXT_FLOOR);
  });

  it.each(FREE_PICKS)('keeps %s readable as text on both pages', (tone) => {
    const recipe = groupToneRecipe(tone);

    expect(contrastOf(recipe.inkLight, LIGHT_PAGE)).toBeGreaterThanOrEqual(TEXT_FLOOR);
    expect(contrastOf(recipe.inkDark, DARK_PANEL)).toBeGreaterThanOrEqual(TEXT_FLOOR);
    expect(contrastOf(recipe.edgeDark, DARK_PANEL)).toBeGreaterThanOrEqual(EDGE_FLOOR);
  });

  it.each(['#FFEB3B', '#12AB9C', '#FF0000'])('keeps the hue of %s', (tone) => {
    const picked = oklchOf(tone).h;
    const shown = oklchOf(groupToneRecipe(tone).fieldLight).h;

    expect(Math.abs(picked - shown)).toBeLessThan(8);
  });

  it('keeps a picked colour that is already readable', () => {
    expect(groupToneRecipe('#123456').fieldLight).toBe('#123456');
  });

  it('reads lower-case picks like upper-case ones', () => {
    expect(groupToneRecipe('#ffeb3b')).toEqual(groupToneRecipe('#FFEB3B'));
  });
});

describe('areTonesAlike', () => {
  it('tells every suggested tone apart from the others', () => {
    const alikePairs = GROUP_TONE_PRESETS.flatMap((first, index) =>
      GROUP_TONE_PRESETS.slice(index + 1).filter((second) => areTonesAlike(first, second)),
    );

    expect(alikePairs).toEqual([]);
  });

  it.each([
    ['#1F7565', '#1F7565', true],
    ['#1F7565', '#217767', true],
    ['#1F7565', '#BA3264', false],
    ['#FFEB3B', '#ffeb3b', true],
  ])('compares %s with %s', (first, second, expected) => {
    expect(areTonesAlike(first, second)).toBe(expected);
  });
});

describe('isToneTaken', () => {
  it.each([
    [['#BA3264', '#217767'], true],
    [['#BA3264'], false],
    [[], false],
  ])('finds the tone among %j', (taken, expected) => {
    expect(isToneTaken('#1F7565', taken)).toBe(expected);
  });
});
