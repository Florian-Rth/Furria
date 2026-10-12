import { describe, expect, it } from 'vitest';
import { aspectRatioCss } from './image-aspect';

describe('aspectRatioCss', () => {
  it.each([
    ['a portrait', 'portrait' as const, '4 / 5'],
    ['a group picture', 'groupPicture' as const, '3 / 2'],
    ['a banner', 'banner' as const, '2 / 1'],
    ['a landscape', 'landscape' as const, '7 / 5'],
    ['a plain ratio that reduces to a small fraction', 1.75, '7 / 4'],
    ['a camera ratio with no small fraction', 4000 / 2667, String(4000 / 2667)],
  ])('writes %s as a CSS ratio', (_, aspect, expected) => {
    expect(aspectRatioCss(aspect)).toBe(expected);
  });
});
