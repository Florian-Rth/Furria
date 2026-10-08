import { describe, expect, it } from 'vitest';
import { resolvePhotoIndex } from './photo-viewer-search';

describe('resolvePhotoIndex', () => {
  it.each([
    [1, 0],
    [12, 11],
    [undefined, null],
    [13, null],
  ])('resolves the param %s of a 12-photo Album to %s', (photo, index) => {
    expect(resolvePhotoIndex(photo, 12)).toBe(index);
  });
});
