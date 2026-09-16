import type { CSSObject } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { kkTheme } from '../theme';
import { applyScheme } from './scheme-paint';

const isStyleObject = (value: CSSObject[string]): value is CSSObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const darkBlock = (styles: CSSObject): CSSObject => {
  const darkKey = Object.keys(styles).find((key) => key.includes('&'));

  if (darkKey === undefined) {
    return {};
  }

  const block = styles[darkKey];

  return isStyleObject(block) ? block : {};
};

const lightBlock = (styles: CSSObject): CSSObject => {
  const entries = Object.entries(styles).filter(([key]) => !key.includes('&'));

  return Object.fromEntries(entries);
};

describe('applyScheme', () => {
  it('keeps the light half at the top level and the dark half behind a selector', () => {
    const result = applyScheme(kkTheme, { light: { color: 'a' }, dark: { color: 'b' } });

    expect(lightBlock(result)).toEqual({ color: 'a' });
    expect(darkBlock(result)).toEqual({ color: 'b' });
  });

  it('merges both halves of several schemes instead of dropping all but the last', () => {
    const result = applyScheme(
      kkTheme,
      { light: { backgroundColor: 'a' }, dark: { backgroundColor: 'b' } },
      { light: { boxShadow: 'c' }, dark: { boxShadow: 'd' } },
    );

    expect(lightBlock(result)).toEqual({ backgroundColor: 'a', boxShadow: 'c' });
    expect(darkBlock(result)).toEqual({ backgroundColor: 'b', boxShadow: 'd' });
  });

  it('lets a later scheme win the properties it redeclares', () => {
    const result = applyScheme(
      kkTheme,
      { light: { color: 'a', boxShadow: 'c' }, dark: { color: 'b' } },
      { light: { color: 'x' }, dark: { color: 'y' } },
    );

    expect(lightBlock(result)).toEqual({ color: 'x', boxShadow: 'c' });
    expect(darkBlock(result)).toEqual({ color: 'y' });
  });

  it('produces only the light half when no scheme carries a dark delta', () => {
    const result = applyScheme(kkTheme, { light: { color: 'a' }, dark: {} });

    expect(lightBlock(result)).toEqual({ color: 'a' });
    expect(darkBlock(result)).toEqual({});
  });
});
