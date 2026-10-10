import { describe, expect, it } from 'vitest';
import { centredBannerCropOf } from './news-picture';

describe('centredBannerCropOf', () => {
  it.each([
    {
      label: 'a wide panorama',
      width: 4000,
      height: 1000,
      expected: { left: 0.25, top: 0, width: 0.5, height: 1 },
    },
    {
      label: 'a 3:2 photo',
      width: 3000,
      height: 2000,
      expected: { left: 0, top: 0.125, width: 1, height: 0.75 },
    },
    {
      label: 'an exact banner',
      width: 2000,
      height: 1000,
      expected: { left: 0, top: 0, width: 1, height: 1 },
    },
    {
      label: 'unknown dimensions',
      width: null,
      height: null,
      expected: { left: 0, top: 0, width: 1, height: 1 },
    },
  ])('cuts $label to a centred 2:1 banner', ({ width, height, expected }) => {
    const crop = centredBannerCropOf(width, height);
    expect(crop.left).toBeCloseTo(expected.left);
    expect(crop.top).toBeCloseTo(expected.top);
    expect(crop.width).toBeCloseTo(expected.width);
    expect(crop.height).toBeCloseTo(expected.height);
  });
});
