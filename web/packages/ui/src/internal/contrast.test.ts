import { describe, expect, it } from 'vitest';
import { kkTokens } from '../tokens';
import { contrastRatio, parseColor, relativeLuminance, washOver } from './contrast';
import { toneRecipes } from './tone';

const AA_SMALL_TEXT = 4.5;

const light = kkTokens.color.light;
const dark = kkTokens.color.dark;

const luminanceOf = (value: string): number => {
  const color = parseColor(value);

  return color === null ? Number.NaN : relativeLuminance(color);
};

describe('the elevation axis', () => {
  it.each([
    { scheme: 'light', tokens: light },
    { scheme: 'dark', tokens: dark },
  ])('lifts a raised surface above both the page and a panel in $scheme', ({ tokens }) => {
    const raised = luminanceOf(tokens.panel2);

    expect(raised).toBeGreaterThan(luminanceOf(tokens.bg));
    expect(raised).toBeGreaterThan(luminanceOf(tokens.panel));
  });

  it('never reuses the dark chrome ground as a content surface', () => {
    expect(dark.panel2).not.toBe(kkTokens.chrome.dark.base);
    expect(dark.panel2).not.toBe(kkTokens.chrome.dark.sideBg);
  });
});

describe('contrastRatio', () => {
  it.each([
    { foreground: '#000000', background: '#FFFFFF', expected: 21 },
    { foreground: '#FFFFFF', background: '#FFFFFF', expected: 1 },
    { foreground: '#FFF', background: '#000', expected: 21 },
  ])('rates $foreground on $background at $expected', ({ foreground, background, expected }) => {
    expect(contrastRatio(foreground, background)).toBeCloseTo(expected, 1);
  });

  it('composites a translucent foreground over its ground before measuring', () => {
    const opaque = contrastRatio('rgba(20,22,26,1)', '#FAFBFC');
    const translucent = contrastRatio('rgba(20,22,26,0.4)', '#FAFBFC');

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
    { ground: 'a panel', ink: light.redInk, panel: light.panel },
    { ground: 'the page', ink: light.redInk, panel: light.bg },
    { ground: 'a raised surface', ink: light.redInk, panel: light.panel2 },
  ])('clears AA on $ground in light', ({ ink, panel }) => {
    expect(contrastRatio(ink, panel)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  });

  it.each([
    { ground: 'a panel', panel: light.panel },
    { ground: 'the page', panel: light.bg },
    { ground: 'a raised surface', panel: light.panel2 },
  ])('is why the ink token, not the fill, carries it on $ground', ({ panel }) => {
    expect(contrastRatio(light.redInk, panel)).toBeGreaterThan(contrastRatio(light.red, panel));
  });
});

describe('the selected register letter', () => {
  it.each([
    { scheme: 'light', ink: light.redInk, wash: washOver(light.red, '10%', light.panel) },
    { scheme: 'dark', ink: dark.redInk, wash: washOver(dark.red, '18%', dark.panel) },
  ])('clears AA on the accent wash in $scheme', ({ ink, wash }) => {
    expect(contrastRatio(ink, wash)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  });

  it.each([
    { scheme: 'light', fill: light.red, wash: washOver(light.red, '10%', light.panel) },
    { scheme: 'dark', fill: dark.red, wash: washOver(dark.red, '18%', dark.panel) },
  ])('is why the fill token cannot carry it in $scheme', ({ fill, wash }) => {
    expect(contrastRatio(fill, wash)).toBeLessThan(AA_SMALL_TEXT);
  });
});

describe('the focused field label on the notch', () => {
  it.each([
    { scheme: 'light', ink: light.redInk, ground: light.panel },
    { scheme: 'dark', ink: dark.redInk, ground: dark.panel },
  ])('clears AA in $scheme', ({ ink, ground }) => {
    expect(contrastRatio(ink, ground)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  });

  it('is why the ink token, not the primary fill, carries it on the notch', () => {
    expect(contrastRatio(light.redInk, light.panel)).toBeGreaterThan(
      contrastRatio(light.red, light.panel),
    );
  });
});

describe('the switch-row validation line', () => {
  it.each([
    { scheme: 'light', ink: light.redInk, panel: light.panel },
    { scheme: 'dark', ink: dark.redInk, panel: dark.panel },
  ])('clears AA on the panel it paints on in $scheme', ({ ink, panel }) => {
    expect(contrastRatio(ink, panel)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  });

  it('is why the destructive fill token cannot carry it on the dark panel', () => {
    expect(contrastRatio(dark.redDk, dark.panel)).toBeLessThan(AA_SMALL_TEXT);
  });
});

describe('the app chrome — the rail, the curtain and the mobile dock', () => {
  const lightChrome = kkTokens.chrome.light.sideBg;
  const darkChrome = kkTokens.chrome.dark.sideBg;

  it.each([
    { role: 'the active nav label', ink: light.ink },
    { role: 'a resting nav label', ink: light.sub },
    { role: 'the active nav icon and any red accent string', ink: light.redInk },
  ])('clears AA for $role on the light side ground', ({ ink }) => {
    expect(contrastRatio(ink, lightChrome)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  });

  it.each([
    { role: 'the active nav label', ink: dark.ink },
    { role: 'a resting nav label', ink: dark.sub },
    { role: 'the active nav icon and any red accent string', ink: dark.redInk },
  ])('clears AA for $role on the dark side ground', ({ ink }) => {
    expect(contrastRatio(ink, darkChrome)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  });

  it.each([
    {
      scheme: 'light',
      source: light.ink,
      ground: lightChrome,
      ink: toneRecipes.neutral.inkLight,
      share: toneRecipes.neutral.groundLight,
    },
    {
      scheme: 'dark',
      source: dark.ink,
      ground: darkChrome,
      ink: toneRecipes.neutral.inkDark,
      share: toneRecipes.neutral.groundDark,
    },
  ])(
    'clears AA for the neutral hint chip on the $scheme side ground',
    ({ source, ground, ink, share }) => {
      expect(contrastRatio(ink, washOver(source, share, ground))).toBeGreaterThanOrEqual(
        AA_SMALL_TEXT,
      );
    },
  );

  it('keeps each scheme on its own side ground rather than one permanent dark rail', () => {
    expect(luminanceOf(lightChrome)).toBeGreaterThan(luminanceOf(light.ink));
    expect(luminanceOf(darkChrome)).toBeLessThan(luminanceOf(dark.ink));
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
