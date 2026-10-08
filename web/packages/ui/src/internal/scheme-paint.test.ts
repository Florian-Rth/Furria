import { describe, expect, it } from 'vitest';
import { mergeSchemes } from './scheme-paint';

describe('mergeSchemes', () => {
  it('merges both halves of several schemes, a later scheme winning what it redeclares', () => {
    expect(
      mergeSchemes([
        { light: { color: 'a', boxShadow: 'c' }, dark: { color: 'b' } },
        { light: { color: 'x' }, dark: { backgroundColor: 'y' } },
      ]),
    ).toEqual({
      light: { color: 'x', boxShadow: 'c' },
      dark: { color: 'b', backgroundColor: 'y' },
    });
  });
});
