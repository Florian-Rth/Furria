import { describe, expect, it } from 'vitest';
import { clockOf, eightsOf, percentOf, preciseClockOf, rangeClockOf } from './studio-b-format';

describe('clockOf', () => {
  it.each([
    [0, '0:00'],
    [7.9, '0:07'],
    [61.2, '1:01'],
    [178.4, '2:58'],
    [-3, '0:00'],
  ])('%s s reads %s', (seconds, expected) => {
    expect(clockOf(seconds)).toBe(expected);
  });
});

describe('preciseClockOf', () => {
  it.each([
    [0, '0:00,0'],
    [15.2381, '0:15,2'],
    [68.5714, '1:08,5'],
    [59.99, '0:59,9'],
  ])('%s s reads %s', (seconds, expected) => {
    expect(preciseClockOf(seconds)).toBe(expected);
  });
});

describe('rangeClockOf', () => {
  it('joins both ends', () => {
    expect(rangeClockOf({ start: 15.2, end: 30.5 })).toBe('0:15–0:30');
  });
});

describe('eightsOf', () => {
  it.each([
    [4, '4×8'],
    [3.5, '3½×8'],
    [3.9, '4×8'],
    [0.5, '½×8'],
    [0, '0×8'],
  ])('%s eights read %s', (eights, expected) => {
    expect(eightsOf(eights)).toBe(expected);
  });
});

describe('percentOf', () => {
  it.each([
    [0.5, '50 %'],
    [0.7000001, '70 %'],
    [1, '100 %'],
  ])('%s reads %s', (rate, expected) => {
    expect(percentOf(rate)).toBe(expected);
  });
});
