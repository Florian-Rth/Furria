import { describe, expect, it } from 'vitest';
import { measureText, parseMeasure } from './hall-measure-text';

describe('parseMeasure', () => {
  it.each([
    { text: '120', expected: 120 },
    { text: ' 80,6 ', expected: 81 },
    { text: '', expected: null },
    { text: 'abc', expected: null },
    { text: '5', expected: null },
    { text: '5000', expected: null },
  ])('reads "$text"', ({ text, expected }) => {
    expect(parseMeasure(text, { min: 10, max: 2000 })).toBe(expected);
  });
});

describe('measureText', () => {
  it.each([
    { value: 119.6, expected: '120' },
    { value: 0, expected: '0' },
  ])('writes $value', ({ value, expected }) => {
    expect(measureText(value)).toBe(expected);
  });
});
