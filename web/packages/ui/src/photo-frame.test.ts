import { describe, expect, it } from 'vitest';
import { resolvePhotoFrame } from './photo-frame';
import { kkTokens } from './tokens';

describe('resolvePhotoFrame', () => {
  it('takes the aspect ratio straight from the tokens', () => {
    expect(resolvePhotoFrame('portrait').aspectRatio).toBe(kkTokens.aspectRatio.portrait);
    expect(resolvePhotoFrame('landscape').aspectRatio).toBe(kkTokens.aspectRatio.landscape);
  });

  it('derives whole intrinsic dimensions that match the aspect ratio', () => {
    for (const orientation of ['portrait', 'landscape'] as const) {
      const frame = resolvePhotoFrame(orientation);
      const [widthUnits, heightUnits] = frame.aspectRatio.split('/').map(Number);

      expect(Number.isInteger(frame.width)).toBe(true);
      expect(Number.isInteger(frame.height)).toBe(true);
      expect(frame.width / frame.height).toBeCloseTo(Number(widthUnits) / Number(heightUnits));
    }
  });

  it('makes a landscape frame wider than a portrait one at the same height', () => {
    const portrait = resolvePhotoFrame('portrait');
    const landscape = resolvePhotoFrame('landscape');

    expect(landscape.height).toBe(portrait.height);
    expect(landscape.width).toBeGreaterThan(portrait.width);
  });
});
