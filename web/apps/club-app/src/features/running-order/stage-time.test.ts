import { describe, expect, it } from 'vitest';
import { toStageTime } from './stage-time';

describe('toStageTime', () => {
  it.each([
    [0, '2027-02-06T18:11:00Z', '19:11'],
    [1, '2027-02-06T18:23:29Z', 'ca. 19:25'],
    [4, '2027-02-06T19:02:29Z', 'ca. 20:00'],
    [7, '2027-02-06T22:58:00Z', 'ca. 00:00'],
  ])('formats position %i starting at %s as %s', (position, stageStartsAt, expected) => {
    expect(toStageTime(position, stageStartsAt)).toBe(expected);
  });
});
