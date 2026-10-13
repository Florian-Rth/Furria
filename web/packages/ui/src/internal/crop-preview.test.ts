import { describe, expect, it } from 'vitest';
import { cropBackgroundOf } from './crop-preview';

describe('cropBackgroundOf', () => {
  it.each([
    {
      crop: { left: 0, top: 0, width: 1, height: 1 },
      expected: { size: '100% 100%', position: '0% 0%' },
    },
    {
      crop: { left: 0.25, top: 0, width: 0.5, height: 1 },
      expected: { size: '200% 100%', position: '50% 0%' },
    },
    {
      crop: { left: 0, top: 0.5, width: 1, height: 0.5 },
      expected: { size: '100% 200%', position: '0% 100%' },
    },
  ])('places $crop', ({ crop, expected }) => {
    expect(cropBackgroundOf(crop)).toEqual(expected);
  });
});
