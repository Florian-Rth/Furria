import { describe, expect, it } from 'vitest';
import { toDayTime, toInstant } from './day';

describe('toInstant', () => {
  it.each([
    ['2027-01-20', '19:45'],
    ['2027-12-31', '23:59'],
  ])('carries %s %s back out unchanged', (day, time) => {
    expect(toDayTime(toInstant(day, time))).toEqual({ day, time });
  });
});
