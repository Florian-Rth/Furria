import { kkTokens } from '@furria/ui';
import { describe, expect, it } from 'vitest';
import type { PhotoOrientation } from './gallery-content';
import { PHOTO_GRID_COLUMNS, resolvePhotoTileShape } from './photo-grid-spans';

const BREAKPOINTS = ['xs', 'sm', 'md'] as const;

const ORIENTATIONS: PhotoOrientation[] = ['portrait', 'landscape'];

const ratioOf = (aspectRatio: string): number => {
  const [width, height] = aspectRatio.split(' / ');
  return Number(width) / Number(height);
};

describe('resolvePhotoTileShape', () => {
  it('gives a portrait one grid unit and a landscape two', () => {
    expect(resolvePhotoTileShape('portrait').span).toEqual({ xs: 6, sm: 4, md: 3 });
    expect(resolvePhotoTileShape('landscape').span).toEqual({ xs: 12, sm: 8, md: 6 });
  });

  it('keeps a landscape exactly twice as wide as a portrait at every breakpoint', () => {
    const portrait = resolvePhotoTileShape('portrait').span;
    const landscape = resolvePhotoTileShape('landscape').span;

    for (const breakpoint of BREAKPOINTS) {
      expect(landscape[breakpoint]).toBe(portrait[breakpoint] * 2);
    }
  });

  it('spans whole grid columns and never more than the grid holds', () => {
    for (const orientation of ORIENTATIONS) {
      const { span } = resolvePhotoTileShape(orientation);

      for (const breakpoint of BREAKPOINTS) {
        expect(Number.isInteger(span[breakpoint])).toBe(true);
        expect(span[breakpoint]).toBeGreaterThan(0);
        expect(span[breakpoint]).toBeLessThanOrEqual(PHOTO_GRID_COLUMNS);
      }
    }
  });

  it('sizes the grid unit so a row of portraits fills it exactly', () => {
    const portrait = resolvePhotoTileShape('portrait').span;

    for (const breakpoint of BREAKPOINTS) {
      expect(PHOTO_GRID_COLUMNS % portrait[breakpoint]).toBe(0);
    }
  });

  it('scales the aspect ratio with the span so both orientations end up the same height', () => {
    const portrait = resolvePhotoTileShape('portrait');
    const landscape = resolvePhotoTileShape('landscape');

    expect(portrait.aspectRatio).toBe(kkTokens.aspectRatio.portrait);
    expect(landscape.aspectRatio).toBe('8 / 5');

    for (const breakpoint of BREAKPOINTS) {
      const portraitHeight = portrait.span[breakpoint] / ratioOf(portrait.aspectRatio);
      const landscapeHeight = landscape.span[breakpoint] / ratioOf(landscape.aspectRatio);

      expect(landscapeHeight).toBeCloseTo(portraitHeight);
    }
  });
});
