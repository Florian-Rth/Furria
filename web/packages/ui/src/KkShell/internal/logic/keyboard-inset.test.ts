import { describe, expect, it } from 'vitest';
import { isKeyboardOpen } from './keyboard-inset';

describe('isKeyboardOpen', () => {
  it.each([
    { label: 'nothing occludes the viewport', viewportHeight: 844, offsetTop: 0, expected: false },
    { label: 'a browser toolbar shrinks it', viewportHeight: 780, offsetTop: 0, expected: false },
    { label: 'a keyboard takes the lower half', viewportHeight: 508, offsetTop: 0, expected: true },
    { label: 'a pinched viewport is offset', viewportHeight: 508, offsetTop: 336, expected: false },
  ])('is $expected when $label', ({ viewportHeight, offsetTop, expected }) => {
    expect(isKeyboardOpen({ innerHeight: 844, viewportHeight, offsetTop })).toBe(expected);
  });
});
