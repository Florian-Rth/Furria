import { beatSecondsOf, musicTicksOf } from '@furria/studio/desk-time';
import { describe, expect, it } from 'vitest';

const marksOf = (beats: number, beat: number, firstCount = 1) =>
  Array.from({ length: beats }, (_, index) => ({
    seconds: index * beat,
    count: ((index + firstCount - 1) % 8) + 1,
  }));

describe('beatSecondsOf', () => {
  it.each([
    [marksOf(16, 0.5), 0.5],
    [marksOf(9, 0.4), 0.4],
    [[], 0.5],
  ])('finds the typical beat', (marks, expected) => {
    expect(beatSecondsOf(marks)).toBeCloseTo(expected);
  });
});

describe('musicTicksOf', () => {
  it('keeps only the ones when zoomed out', () => {
    const ticks = musicTicksOf(marksOf(32, 0.5), 5);
    expect(ticks.map((tick) => [tick.strong, tick.text])).toEqual([
      [true, '1'],
      [true, '2'],
      [true, '3'],
      [true, '4'],
    ]);
  });

  it('numbers every count when zoomed in', () => {
    const ticks = musicTicksOf(marksOf(9, 0.5), 60);
    expect(ticks.map((tick) => tick.text)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '2']);
  });

  it('counts the first eight even when the music starts mid-eight', () => {
    const ticks = musicTicksOf(marksOf(6, 0.5, 5), 60);
    expect(ticks.map((tick) => tick.text)).toEqual(['5', '6', '7', '8', '2', '2']);
  });

  it('drops the earlier eight number when the next one would collide with it', () => {
    const marks = [
      { seconds: 0, count: 1 },
      { seconds: 0.5, count: 2 },
      { seconds: 0.6, count: 1 },
      { seconds: 1.1, count: 2 },
      { seconds: 4.6, count: 1 },
    ];
    const ticks = musicTicksOf(marks, 20);
    expect(ticks.filter((tick) => tick.strong).map((tick) => tick.text)).toEqual([null, '2', '3']);
  });
});
