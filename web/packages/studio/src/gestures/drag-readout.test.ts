import { describe, expect, it } from 'vitest';
import { formatReadoutMetres, formatReadoutTime } from './drag-readout';

describe('formatReadoutTime', () => {
  it.each([
    { seconds: 83.4, expected: '1:23,4' },
    { seconds: 59.96, expected: '1:00,0' },
    { seconds: 7.04, expected: '0:07,0' },
    { seconds: -2, expected: '0:00,0' },
  ])('shows $seconds s as $expected', ({ seconds, expected }) => {
    expect(formatReadoutTime(seconds)).toBe(expected);
  });
});

describe('formatReadoutMetres', () => {
  it.each([
    { metres: 2.5, expected: '2,5 m' },
    { metres: -1.26, expected: '1,3 m' },
    { metres: 0, expected: '0,0 m' },
  ])('shows $metres m as $expected', ({ metres, expected }) => {
    expect(formatReadoutMetres(metres)).toBe(expected);
  });
});
