import { describe, expect, it } from 'vitest';
import type { PhotoOrientation } from './gallery-content';
import type { PhotoTileShape } from './photo-grid-spans';
import { resolvePhotoTileShape } from './photo-grid-spans';

describe('resolvePhotoTileShape', () => {
  it.each<[PhotoOrientation, PhotoTileShape]>([
    ['portrait', { span: { xs: 6, sm: 4, md: 3 }, aspectRatio: '4 / 5' }],
    ['landscape', { span: { xs: 12, sm: 8, md: 6 }, aspectRatio: '8 / 5' }],
  ])('shapes a %s tile', (orientation, shape) => {
    expect(resolvePhotoTileShape(orientation)).toEqual(shape);
  });
});
