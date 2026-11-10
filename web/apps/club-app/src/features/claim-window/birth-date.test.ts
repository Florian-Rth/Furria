import { describe, expect, it } from 'vitest';
import { birthDateOf } from './birth-date';

describe('birthDateOf', () => {
  it.each([
    ['7', '3', '1961', '1961-03-07'],
    [' 07 ', '03', '1961', '1961-03-07'],
    ['29', '2', '2000', '2000-02-29'],
    ['31', '12', '1949', '1949-12-31'],
  ])('reads %s.%s.%s as %s', (day, month, year, expected) => {
    expect(birthDateOf(day, month, year)).toBe(expected);
  });

  it.each([
    ['', '3', '1961'],
    ['31', '4', '1961'],
    ['29', '2', '2001'],
    ['0', '1', '1961'],
    ['7', '13', '1961'],
    ['7', '3', '61'],
    ['7', '3', '19a1'],
    ['7.5', '3', '1961'],
  ])('rejects %s.%s.%s', (day, month, year) => {
    expect(birthDateOf(day, month, year)).toBeNull();
  });
});
