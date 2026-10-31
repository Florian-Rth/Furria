import { describe, expect, it } from 'vitest';
import { svgIntrinsicSizeOf } from './svg-intrinsic-size';

describe('svgIntrinsicSizeOf', () => {
  it.each([
    { markup: '<svg viewBox="0 0 1200 800"></svg>', expected: { width: 1200, height: 800 } },
    { markup: "<svg viewBox='10,20,300,150'></svg>", expected: { width: 300, height: 150 } },
    {
      markup: '<svg width="210mm" height="297mm" viewBox="0 0 210 297"></svg>',
      expected: { width: 210, height: 297 },
    },
    { markup: '<svg width="400" height="200"></svg>', expected: { width: 400, height: 200 } },
    { markup: '<svg width="400px" height="1in"></svg>', expected: { width: 400, height: 96 } },
    {
      markup:
        '<?xml version="1.0"?>\n<svg\n  xmlns="http://www.w3.org/2000/svg"\n  viewBox="0 0 16 9">',
      expected: { width: 16, height: 9 },
    },
    {
      markup: '<svg stroke-width="3" width="30" height="10"></svg>',
      expected: { width: 30, height: 10 },
    },
  ])('reads $markup', ({ markup, expected }) => {
    expect(svgIntrinsicSizeOf(markup)).toEqual(expected);
  });

  it.each([
    '<svg></svg>',
    '<svg width="100%" height="100%"></svg>',
    '<svg viewBox="0 0 0 10"></svg>',
    '<svg viewBox="0 0 10"></svg>',
    '<svg width="10"></svg>',
    '<html></html>',
  ])('finds no size in %s', (markup) => {
    expect(svgIntrinsicSizeOf(markup)).toBeNull();
  });
});
