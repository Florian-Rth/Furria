import { describe, expect, it } from 'vitest';
import { kkTokens } from '../tokens';
import { chromeDensityAt, chromeMaterialAt } from './chrome-density';

const { material, scrollTravel } = kkTokens.shell;

describe('chromeDensityAt', () => {
  it.each([
    { scrollOffset: -240, expected: 0 },
    { scrollOffset: 0, expected: 0 },
    { scrollOffset: scrollTravel / 4, expected: 0.25 },
    { scrollOffset: scrollTravel / 2, expected: 0.5 },
    { scrollOffset: scrollTravel, expected: 1 },
    { scrollOffset: scrollTravel * 40, expected: 1 },
  ])('reads $expected density at offset $scrollOffset', ({ scrollOffset, expected }) => {
    expect(chromeDensityAt(scrollOffset)).toBeCloseTo(expected);
  });
});

describe('chromeDensityAt under reduced motion', () => {
  it.each([
    { scrollOffset: -240, expected: 0 },
    { scrollOffset: 0, expected: 0 },
    { scrollOffset: 1, expected: 1 },
    { scrollOffset: scrollTravel / 2, expected: 1 },
    { scrollOffset: scrollTravel * 40, expected: 1 },
  ])('snaps to $expected at offset $scrollOffset', ({ scrollOffset, expected }) => {
    expect(chromeDensityAt(scrollOffset, 'instant')).toBe(expected);
  });
});

describe('chromeMaterialAt', () => {
  it('rests at the transparent end of every value', () => {
    const chrome = chromeMaterialAt(0);

    expect(chrome.blurRadius).toBeCloseTo(material.blur.rest);
    expect(chrome.shadowOffsetY).toBeCloseTo(material.shadowOffsetY.rest);
    expect(chrome.shadowBlur).toBeCloseTo(material.shadowBlur.rest);
    expect(chrome.light.tint).toBeCloseTo(material.light.rest.tint);
    expect(chrome.light.hairline).toBeCloseTo(material.light.rest.hairline);
    expect(chrome.light.shadow).toBeCloseTo(material.light.rest.shadow);
    expect(chrome.dark.tint).toBeCloseTo(material.dark.rest.tint);
    expect(chrome.dark.hairline).toBeCloseTo(material.dark.rest.hairline);
    expect(chrome.dark.shadow).toBeCloseTo(material.dark.rest.shadow);
  });

  it('reaches the solid end of every value', () => {
    const chrome = chromeMaterialAt(1);

    expect(chrome.blurRadius).toBeCloseTo(material.blur.dense);
    expect(chrome.shadowOffsetY).toBeCloseTo(material.shadowOffsetY.dense);
    expect(chrome.shadowBlur).toBeCloseTo(material.shadowBlur.dense);
    expect(chrome.light.tint).toBeCloseTo(material.light.dense.tint);
    expect(chrome.light.hairline).toBeCloseTo(material.light.dense.hairline);
    expect(chrome.light.shadow).toBeCloseTo(material.light.dense.shadow);
    expect(chrome.dark.tint).toBeCloseTo(material.dark.dense.tint);
    expect(chrome.dark.hairline).toBeCloseTo(material.dark.dense.hairline);
    expect(chrome.dark.shadow).toBeCloseTo(material.dark.dense.shadow);
  });

  it('sits halfway between both ends at half density', () => {
    const chrome = chromeMaterialAt(0.5);

    expect(chrome.blurRadius).toBeCloseTo((material.blur.rest + material.blur.dense) / 2);
    expect(chrome.light.tint).toBeCloseTo(
      (material.light.rest.tint + material.light.dense.tint) / 2,
    );
    expect(chrome.dark.tint).toBeCloseTo((material.dark.rest.tint + material.dark.dense.tint) / 2);
  });

  it.each([{ scheme: 'light' } as const, { scheme: 'dark' } as const])(
    'deepens the $scheme material with every step of density',
    ({ scheme }) => {
      const steps = [0, 0.2, 0.4, 0.6, 0.8, 1].map((density) => chromeMaterialAt(density));

      for (const [index, chrome] of steps.entries()) {
        const previous = steps[index - 1];

        if (previous !== undefined) {
          expect(chrome.blurRadius).toBeGreaterThan(previous.blurRadius);
          expect(chrome.shadowBlur).toBeGreaterThan(previous.shadowBlur);
          expect(chrome[scheme].tint).toBeGreaterThan(previous[scheme].tint);
          expect(chrome[scheme].hairline).toBeGreaterThan(previous[scheme].hairline);
          expect(chrome[scheme].shadow).toBeGreaterThan(previous[scheme].shadow);
        }
      }
    },
  );
});
