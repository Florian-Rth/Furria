import { describe, expect, it } from 'vitest';
import { contrastRatio, hueOf, washOver } from './contrast';

describe('contrastRatio', () => {
  it.each([
    { foreground: '#000000', background: '#FFFFFF', expected: 21 },
    { foreground: '#FFF', background: '#000', expected: 21 },
    { foreground: '#FFFFFF', background: '#FFFFFF', expected: 1 },
    { foreground: 'currentColor', background: '#FFFFFF', expected: 0 },
  ])('rates $foreground on $background at $expected', ({ foreground, background, expected }) => {
    expect(contrastRatio(foreground, background)).toBeCloseTo(expected, 1);
  });

  it('composites a translucent foreground over its ground before measuring', () => {
    const opaque = contrastRatio('rgba(20,22,26,1)', '#FAFBFC');
    const translucent = contrastRatio('rgba(20,22,26,0.4)', '#FAFBFC');

    expect(translucent).toBeLessThan(opaque);
    expect(translucent).toBeGreaterThan(1);
  });
});

describe('hueOf', () => {
  it.each([
    { value: '#FF0000', expected: 0 },
    { value: '#00FF00', expected: 120 },
    { value: '#0000FF', expected: 240 },
    { value: '#FF00FF', expected: 300 },
    { value: 'rgb(255, 128, 0)', expected: 30 },
    { value: '#808080', expected: 0 },
    { value: 'currentColor', expected: 0 },
  ])('places $value at $expected degrees', ({ value, expected }) => {
    expect(hueOf(value)).toBeCloseTo(expected, 0);
  });
});

describe('washOver', () => {
  it.each([
    { amount: '0%', expected: 'rgb(255, 255, 255)' },
    { amount: '100%', expected: 'rgb(0, 0, 0)' },
  ])('blends a black wash over white by $amount', ({ amount, expected }) => {
    expect(washOver('#000000', amount, '#FFFFFF')).toBe(expected);
  });
});
