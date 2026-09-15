import { describe, expect, it } from 'vitest';
import { keyboardInsetOf } from './keyboard-inset';

describe('keyboardInsetOf', () => {
  it.each([
    { label: 'nothing occludes the viewport', viewportHeight: 844, offsetTop: 0, expected: 0 },
    { label: 'a browser toolbar shrinks it', viewportHeight: 780, offsetTop: 0, expected: 0 },
    { label: 'a keyboard takes the lower half', viewportHeight: 508, offsetTop: 0, expected: 336 },
    { label: 'a pinched viewport is offset', viewportHeight: 508, offsetTop: 336, expected: 0 },
  ])('is $expected when $label', ({ viewportHeight, offsetTop, expected }) => {
    expect(keyboardInsetOf({ innerHeight: 844, viewportHeight, offsetTop })).toBe(expected);
  });
});
