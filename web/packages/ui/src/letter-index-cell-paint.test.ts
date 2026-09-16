import type { CSSObject } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { letterIndexCurrentPaint } from './letter-index-cell-paint';
import { kkTheme } from './theme';

const isStyleObject = (value: CSSObject[string]): value is CSSObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const darkBlocks = (styles: CSSObject): CSSObject[] =>
  Object.entries(styles)
    .filter(([key]) => key.includes('&'))
    .map(([, block]) => block)
    .filter(isStyleObject);

describe('letterIndexCurrentPaint', () => {
  const paint = letterIndexCurrentPaint(kkTheme);

  it('paints the selected letter in both halves of the scheme', () => {
    expect(paint.color).toBeDefined();
    expect(paint.backgroundColor).toBeDefined();
  });

  it('carries exactly one dark-scheme block, so neither half can overwrite the other', () => {
    expect(darkBlocks(paint)).toHaveLength(1);
  });

  it('repaints both the ink and the wash in dark, not just the wash', () => {
    const [dark] = darkBlocks(paint);

    expect(dark?.color).toBeDefined();
    expect(dark?.backgroundColor).toBeDefined();
    expect(dark?.color).not.toBe(paint.color);
    expect(dark?.backgroundColor).not.toBe(paint.backgroundColor);
  });
});
