import { describe, expect, it } from 'vitest';
import { centredCrop } from './image-crop';

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
