import { describe, expect, it } from 'vitest';
import { kkTokens } from '../tokens';
import { contrastRatio, washOver } from './contrast';
import { toneRecipes } from './tone';

const AA_SMALL_TEXT = 4.5;

const light = kkTokens.color.light;
const dark = kkTokens.color.dark;

describe('contrastRatio', () => {
  it.each([
    { foreground: '#000000', background: '#FFFFFF', expected: 21 },
    { foreground: '#FFFFFF', background: '#FFFFFF', expected: 1 },
    { foreground: '#FFF', background: '#000', expected: 21 },
  ])('rates $foreground on $background at $expected', ({ foreground, background, expected }) => {
    expect(contrastRatio(foreground, background)).toBeCloseTo(expected, 1);
  });

  it('composites a translucent foreground over its ground before measuring', () => {
    const opaque = contrastRatio('rgba(26,20,17,1)', '#FBF4E6');
    const translucent = contrastRatio('rgba(26,20,17,0.4)', '#FBF4E6');

    expect(translucent).toBeLessThan(opaque);
    expect(translucent).toBeGreaterThan(1);
  });

  it('returns no ratio for a colour it cannot read', () => {
    expect(contrastRatio('currentColor', '#FFFFFF')).toBe(0);
  });
});

describe('washOver', () => {
  it('blends a wash towards its ground by the given share', () => {
    expect(washOver('#000000', '0%', '#FFFFFF')).toBe('rgb(255, 255, 255)');
    expect(washOver('#000000', '100%', '#FFFFFF')).toBe('rgb(0, 0, 0)');
  });
});

describe('the red button label', () => {
  it.each([
    { scheme: 'light', ink: light.redInk, panel: light.panel },
    { scheme: 'light on the page ground', ink: light.redInk, panel: light.bg },
    { scheme: 'light on a raised surface', ink: light.redInk, panel: light.panel2 },
    { scheme: 'dark', ink: dark.redInk, panel: dark.panel },
    { scheme: 'dark on the page ground', ink: dark.redInk, panel: dark.bg },
    { scheme: 'dark on a raised surface', ink: dark.redInk, panel: dark.panel2 },
  ])('clears AA in $scheme', ({ ink, panel }) => {
    expect(contrastRatio(ink, panel)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  });

  it.each([
    { scheme: 'light', fill: light.redDk, on: light.onRedDk },
    { scheme: 'dark', fill: dark.redDk, on: dark.onRedDk },
  ])('clears AA as a destructive fill in $scheme', ({ fill, on }) => {
    expect(contrastRatio(on, fill)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  });

  it.each([
    { scheme: 'light', fill: light.red, on: light.onRed },
    { scheme: 'dark', fill: dark.red, on: dark.onRed },
  ])('clears AA as the primary fill in $scheme', ({ fill, on }) => {
    expect(contrastRatio(on, fill)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  });
});

describe('the red accent text — eyebrows, row meta and hovered row titles', () => {
  it.each([
    { ground: 'a cream panel', ink: light.redInk, panel: light.panel },
    { ground: 'the page', ink: light.redInk, panel: light.bg },
    { ground: 'a raised surface', ink: light.redInk, panel: light.panel2 },
  ])('clears AA on $ground in light', ({ ink, panel }) => {
    expect(contrastRatio(ink, panel)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  });

  it('is why the light fill token cannot carry it on a cream panel', () => {
    expect(contrastRatio(light.red, light.panel)).toBeLessThan(AA_SMALL_TEXT);
  });
});

const CHIP_TONES = [
  { tone: 'neutral', lightSource: light.ink, darkSource: dark.ink },
  { tone: 'ink', lightSource: light.ink, darkSource: dark.ink },
  { tone: 'accent', lightSource: light.red, darkSource: dark.red },
  { tone: 'gold', lightSource: light.gold, darkSource: dark.gold },
  { tone: 'green', lightSource: light.green, darkSource: dark.green },
  { tone: 'blue', lightSource: light.blue, darkSource: dark.blue },
] as const;

describe('the chip tones', () => {
  it.each(CHIP_TONES)('clears AA for $tone in light', ({ tone, lightSource }) => {
    const recipe = toneRecipes[tone];
    const ground = washOver(lightSource, recipe.groundLight, light.panel);

    expect(contrastRatio(recipe.inkLight, ground)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  });

  it.each(CHIP_TONES)('clears AA for $tone in dark', ({ tone, darkSource }) => {
    const recipe = toneRecipes[tone];
    const ground = washOver(darkSource, recipe.groundDark, dark.panel);

    expect(contrastRatio(recipe.inkDark, ground)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  });
});
