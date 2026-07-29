import { describe, expect, it } from 'vitest';
import { buildPhotoParam, resolvePhotoIndex } from './photo-viewer-search';

describe('resolvePhotoIndex', () => {
  it('turns the one-based param into a zero-based index', () => {
    expect(resolvePhotoIndex(1, 12)).toBe(0);
    expect(resolvePhotoIndex(12, 12)).toBe(11);
  });

  it('resolves nothing without a param', () => {
    expect(resolvePhotoIndex(undefined, 12)).toBeNull();
  });

  it('resolves nothing for a param past the end of the Album', () => {
    expect(resolvePhotoIndex(13, 12)).toBeNull();
    expect(resolvePhotoIndex(99, 12)).toBeNull();
  });
});

describe('buildPhotoParam', () => {
  it('turns the zero-based index back into the one-based param', () => {
    expect(buildPhotoParam(0)).toBe(1);
    expect(buildPhotoParam(11)).toBe(12);
  });

  it('round-trips with resolvePhotoIndex', () => {
    expect(resolvePhotoIndex(buildPhotoParam(7), 12)).toBe(7);
  });
});
