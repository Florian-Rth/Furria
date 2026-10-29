import { describe, expect, it } from 'vitest';
import { stageArtworkFitOf } from './stage-artwork-fit';

describe('stageArtworkFitOf', () => {
  it.each([
    {
      artwork: '<svg viewBox="0 0 1200 800"></svg>',
      size: { widthMetres: 12, depthMetres: 8 },
      expected: 'fits',
    },
    {
      artwork: '<svg viewBox="0 0 1210 800"></svg>',
      size: { widthMetres: 12, depthMetres: 8 },
      expected: 'fits',
    },
    {
      artwork: '<svg viewBox="0 0 1240 800"></svg>',
      size: { widthMetres: 12, depthMetres: 8 },
      expected: 'mismatch',
    },
    {
      artwork: '<svg viewBox="0 0 800 800"></svg>',
      size: { widthMetres: 12, depthMetres: 8 },
      expected: 'mismatch',
    },
    {
      artwork: '<svg width="120mm" height="80mm"></svg>',
      size: { widthMetres: 12, depthMetres: 8 },
      expected: 'fits',
    },
    {
      artwork: '<svg width="300" height="100"></svg>',
      size: { widthMetres: 12, depthMetres: 8 },
      expected: 'mismatch',
    },
    { artwork: '<svg viewBox="0 0 1200 800"></svg>', size: null, expected: 'unknown' },
    {
      artwork: '<svg width="100%" height="100%"></svg>',
      size: { widthMetres: 12, depthMetres: 8 },
      expected: 'unknown',
    },
    { artwork: 'kein svg', size: { widthMetres: 12, depthMetres: 8 }, expected: 'unknown' },
  ])('judges $artwork on $size as $expected', ({ artwork, size, expected }) => {
    expect(stageArtworkFitOf(artwork, size)).toBe(expected);
  });
});
