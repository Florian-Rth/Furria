import { describe, expect, it } from 'vitest';
import { centredCrop, cropInsidePicture } from './image-crop';

describe('centredCrop', () => {
  it.each([
    {
      label: 'a wide panorama to a banner',
      image: { width: 4000, height: 1000 },
      aspect: 'banner' as const,
      expected: { left: 0.25, top: 0, width: 0.5, height: 1 },
    },
    {
      label: 'a 3:2 photo to a banner',
      image: { width: 3000, height: 2000 },
      aspect: 'banner' as const,
      expected: { left: 0, top: 0.125, width: 1, height: 0.75 },
    },
    {
      label: 'an exact banner to a banner',
      image: { width: 2000, height: 1000 },
      aspect: 'banner' as const,
      expected: { left: 0, top: 0, width: 1, height: 1 },
    },
    {
      label: 'a 3:2 photo to a portrait',
      image: { width: 3000, height: 2000 },
      aspect: 'portrait' as const,
      expected: { left: 7 / 30, top: 0, width: 8 / 15, height: 1 },
    },
    {
      label: 'unknown dimensions',
      image: null,
      aspect: 'banner' as const,
      expected: { left: 0, top: 0, width: 1, height: 1 },
    },
    {
      label: 'an unreadable image',
      image: { width: 0, height: 1000 },
      aspect: 'portrait' as const,
      expected: { left: 0, top: 0, width: 1, height: 1 },
    },
  ])('cuts $label centred', ({ image, aspect, expected }) => {
    const crop = centredCrop(image, aspect);
    expect(crop.left).toBeCloseTo(expected.left);
    expect(crop.top).toBeCloseTo(expected.top);
    expect(crop.width).toBeCloseTo(expected.width);
    expect(crop.height).toBeCloseTo(expected.height);
  });
});

describe('cropInsidePicture', () => {
  it.each([
    {
      label: 'rounding past the left and top edges',
      crop: { left: -5.551115123125783e-17, top: -1e-12, width: 0.6, height: 1 },
      expected: { left: 0, top: 0, width: 0.6, height: 1 },
    },
    {
      label: 'rounding past the right and bottom edges',
      crop: { left: 0.4, top: 0.25, width: 0.6000000000000001, height: 0.7500000000000002 },
      expected: { left: 0.4, top: 0.25, width: 0.6, height: 0.75 },
    },
    {
      label: 'a cut larger than the picture',
      crop: { left: -0.1, top: 0, width: 1.2, height: 1.5 },
      expected: { left: 0, top: 0, width: 1, height: 1 },
    },
    {
      label: 'a cut already inside the picture',
      crop: { left: 0.2, top: 0.1, width: 0.5, height: 0.8 },
      expected: { left: 0.2, top: 0.1, width: 0.5, height: 0.8 },
    },
  ])('holds $label inside the picture', ({ crop, expected }) => {
    expect(cropInsidePicture(crop)).toEqual(expected);
  });
});
