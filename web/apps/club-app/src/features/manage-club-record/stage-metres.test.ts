import { describe, expect, it } from 'vitest';
import { formatFormMetres, formatStageSize, parseMetres, stageSizeOf } from './stage-metres';

describe('parseMetres', () => {
  it.each([
    { text: '12', expected: 12 },
    { text: ' 12,5 ', expected: 12.5 },
    { text: '8.25', expected: 8.25 },
    { text: '0,05', expected: 0.05 },
    { text: '12,345', expected: null },
    { text: '12,', expected: null },
    { text: ',5', expected: null },
    { text: '-3', expected: null },
    { text: '1.000,5', expected: null },
    { text: '', expected: null },
  ])('reads "$text" as $expected', ({ text, expected }) => {
    expect(parseMetres(text)).toBe(expected);
  });
});

describe('stageSizeOf', () => {
  it.each([
    { width: '12,5', depth: '8', expected: { widthMetres: 12.5, depthMetres: 8 } },
    { width: '2', depth: '40', expected: { widthMetres: 2, depthMetres: 40 } },
    { width: '1,99', depth: '8', expected: null },
    { width: '12', depth: '40,01', expected: null },
    { width: '', depth: '8', expected: null },
  ])('turns $width × $depth into $expected', ({ width, depth, expected }) => {
    expect(stageSizeOf(width, depth)).toEqual(expected);
  });
});

describe('formatFormMetres', () => {
  it.each([
    { metres: 12, expected: '12' },
    { metres: 12.5, expected: '12,5' },
    { metres: 8.25, expected: '8,25' },
    { metres: 1000, expected: '1000' },
  ])('writes $metres as "$expected"', ({ metres, expected }) => {
    expect(formatFormMetres(metres)).toBe(expected);
  });
});

describe('formatStageSize', () => {
  it.each([
    { size: { widthMetres: 12.5, depthMetres: 8 }, expected: '12,50 × 8,00 m' },
    { size: { widthMetres: 10.25, depthMetres: 6.4 }, expected: '10,25 × 6,40 m' },
  ])('writes $size as "$expected"', ({ size, expected }) => {
    expect(formatStageSize(size)).toBe(expected);
  });
});
