import { describe, expect, it } from 'vitest';
import { logoFileRejectionOf, SESSION_LOGO_MAX_BYTES } from './session-logo-file';

describe('logoFileRejectionOf', () => {
  it.each([
    { scenario: 'a PNG', name: 'logo.png', type: 'image/png', size: 4_200, expected: null },
    { scenario: 'a WebP', name: 'logo.webp', type: 'image/webp', size: 4_200, expected: null },
    { scenario: 'a JPEG', name: 'logo.jpg', type: 'image/jpeg', size: 4_200, expected: null },
    { scenario: 'an untyped HEIC', name: 'IMG_1.HEIC', type: '', size: 4_200, expected: null },
    {
      scenario: 'an SVG',
      name: 'logo.svg',
      type: 'image/svg+xml',
      size: 4_200,
      expected: 'wrong-type',
    },
    {
      scenario: 'an untyped text',
      name: 'logo.txt',
      type: '',
      size: 4_200,
      expected: 'wrong-type',
    },
    {
      scenario: 'a PNG that just fits',
      name: 'logo.png',
      type: 'image/png',
      size: SESSION_LOGO_MAX_BYTES,
      expected: null,
    },
    {
      scenario: 'a PNG beyond the photo limit',
      name: 'logo.png',
      type: 'image/png',
      size: SESSION_LOGO_MAX_BYTES + 1,
      expected: 'too-large',
    },
    {
      scenario: 'a file wrong in type and size',
      name: 'logo.svg',
      type: 'image/svg+xml',
      size: SESSION_LOGO_MAX_BYTES + 1,
      expected: 'wrong-type',
    },
  ])('answers $expected for $scenario', ({ name, type, size, expected }) => {
    expect(logoFileRejectionOf({ name, type, size })).toBe(expected);
  });
});
