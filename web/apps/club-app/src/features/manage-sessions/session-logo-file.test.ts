import { describe, expect, it } from 'vitest';
import { logoFileRejectionOf, SESSION_LOGO_MAX_LENGTH } from './session-logo-file';

describe('logoFileRejectionOf', () => {
  it.each([
    { scenario: 'an SVG', type: 'image/svg+xml', size: 4_200, expected: null },
    { scenario: 'another type', type: 'image/png', size: 4_200, expected: 'wrong-type' },
    { scenario: 'no type', type: '', size: 4_200, expected: 'wrong-type' },
    {
      scenario: 'an SVG that just fits',
      type: 'image/svg+xml',
      size: SESSION_LOGO_MAX_LENGTH,
      expected: null,
    },
    {
      scenario: 'an SVG wider than the column',
      type: 'image/svg+xml',
      size: SESSION_LOGO_MAX_LENGTH + 1,
      expected: 'too-large',
    },
    {
      scenario: 'a file wrong in type and size',
      type: 'image/png',
      size: SESSION_LOGO_MAX_LENGTH + 1,
      expected: 'wrong-type',
    },
  ])('answers $expected for $scenario', ({ type, size, expected }) => {
    expect(logoFileRejectionOf({ type, size })).toBe(expected);
  });
});
