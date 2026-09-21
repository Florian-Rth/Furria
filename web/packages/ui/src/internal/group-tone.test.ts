import { describe, expect, it } from 'vitest';
import { kkTokens } from '../tokens';
import { contrastRatio, hueOf, washOver } from './contrast';
import {
  GROUP_TONE_ON_FIELD_DARK,
  GROUP_TONE_ON_FIELD_LIGHT,
  GROUP_TONES,
  groupToneRecipes,
  isKkGroupTone,
} from './group-tone';
import { toneRecipes } from './tone';

const AA_SMALL_TEXT = 4.5;
const NON_TEXT = 3;
const MIN_TONE_HUE_DISTANCE = 25;
const MIN_SEMANTIC_HUE_DISTANCE = 15;
const HALF_CIRCLE = 180;
const FULL_CIRCLE = 360;

const light = kkTokens.color.light;
const dark = kkTokens.color.dark;

const SEMANTIC_HUES = [light.red, light.gold, light.green, light.blue];

const hueDistance = (left: number, right: number): number => {
  const gap = Math.abs(left - right) % FULL_CIRCLE;

  return gap > HALF_CIRCLE ? FULL_CIRCLE - gap : gap;
};

describe('the group tones', () => {
  it.each(GROUP_TONES)('clears AA for the ink on the %s field in light', (tone) => {
    const recipe = groupToneRecipes[tone];

    expect(contrastRatio(GROUP_TONE_ON_FIELD_LIGHT, recipe.fieldLight)).toBeGreaterThanOrEqual(
      AA_SMALL_TEXT,
    );
  });

  it.each(GROUP_TONES)('clears AA for the ink on the %s field in dark', (tone) => {
    const recipe = groupToneRecipes[tone];

    expect(contrastRatio(GROUP_TONE_ON_FIELD_DARK, recipe.fieldDark)).toBeGreaterThanOrEqual(
      AA_SMALL_TEXT,
    );
  });

  it.each(GROUP_TONES)('clears AA for %s ink on bg, panel and panel2 in light', (tone) => {
    const recipe = groupToneRecipes[tone];

    expect(contrastRatio(recipe.inkLight, light.bg)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
    expect(contrastRatio(recipe.inkLight, light.panel)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
    expect(contrastRatio(recipe.inkLight, light.panel2)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  });

  it.each(GROUP_TONES)('clears AA for %s ink on bg, panel and panel2 in dark', (tone) => {
    const recipe = groupToneRecipes[tone];

    expect(contrastRatio(recipe.inkDark, dark.bg)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
    expect(contrastRatio(recipe.inkDark, dark.panel)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
    expect(contrastRatio(recipe.inkDark, dark.panel2)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  });

  it.each(GROUP_TONES)('keeps the %s field readable as a block in both schemes', (tone) => {
    const recipe = groupToneRecipes[tone];

    expect(contrastRatio(recipe.fieldLight, light.bg)).toBeGreaterThanOrEqual(NON_TEXT);
    expect(contrastRatio(recipe.fieldLight, light.panel)).toBeGreaterThanOrEqual(NON_TEXT);
    expect(contrastRatio(recipe.fieldDark, dark.bg)).toBeGreaterThanOrEqual(NON_TEXT);
    expect(contrastRatio(recipe.fieldDark, dark.panel)).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it.each(GROUP_TONES)('clears the non-text ratio for the %s edge in both schemes', (tone) => {
    const recipe = groupToneRecipes[tone];

    expect(contrastRatio(recipe.edgeLight, light.panel)).toBeGreaterThanOrEqual(NON_TEXT);
    expect(contrastRatio(recipe.edgeLight, light.bg)).toBeGreaterThanOrEqual(NON_TEXT);
    expect(contrastRatio(recipe.edgeDark, dark.panel)).toBeGreaterThanOrEqual(NON_TEXT);
    expect(contrastRatio(recipe.edgeDark, dark.bg)).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it('keeps every field distinct from every other field', () => {
    const hues = GROUP_TONES.map((tone) => hueOf(groupToneRecipes[tone].fieldLight));
    const distances = hues.flatMap((hue, index) =>
      hues.slice(index + 1).map((other) => hueDistance(hue, other)),
    );

    expect(Math.min(...distances)).toBeGreaterThanOrEqual(MIN_TONE_HUE_DISTANCE);
  });

  it('keeps every field distinct from the semantic hues', () => {
    const distances = GROUP_TONES.flatMap((tone) =>
      SEMANTIC_HUES.map((semantic) =>
        hueDistance(hueOf(groupToneRecipes[tone].fieldLight), hueOf(semantic)),
      ),
    );

    expect(Math.min(...distances)).toBeGreaterThanOrEqual(MIN_SEMANTIC_HUE_DISTANCE);
  });

  it('shares no name with the semantic tones, so a group tone can never reach a chip', () => {
    const semanticNames: readonly string[] = Object.keys(toneRecipes);
    const shared = GROUP_TONES.filter((tone) => semanticNames.includes(tone));

    expect(shared).toEqual([]);
  });

  it('recognises its own members and refuses anything else', () => {
    expect(isKkGroupTone('teal')).toBe(true);
    expect(isKkGroupTone('accent')).toBe(false);
    expect(isKkGroupTone('')).toBe(false);
  });
});

describe('the group tone chip', () => {
  it.each(GROUP_TONES)('carries the %s tone as the on-field ink on the field itself', (tone) => {
    const recipe = groupToneRecipes[tone];

    expect(contrastRatio(GROUP_TONE_ON_FIELD_LIGHT, recipe.fieldLight)).toBeGreaterThanOrEqual(
      AA_SMALL_TEXT,
    );
    expect(contrastRatio(GROUP_TONE_ON_FIELD_DARK, recipe.fieldDark)).toBeGreaterThanOrEqual(
      AA_SMALL_TEXT,
    );
  });

  it.each(GROUP_TONES)('is why %s ink can never sit on a wash of its own field', (tone) => {
    const recipe = groupToneRecipes[tone];
    const selfWash = washOver(recipe.fieldLight, '12%', light.panel);

    expect(contrastRatio(recipe.inkLight, selfWash)).toBeLessThan(AA_SMALL_TEXT);
  });
});
