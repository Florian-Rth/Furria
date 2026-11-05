import { describe, expect, it } from 'vitest';
import { curvePathOf, monotoneSegmentsOf, trendKnotsOf } from './pour-stock-trend';

const daysOf = (stocks: readonly number[], maxGlideDays: number): readonly number[] =>
  trendKnotsOf(stocks, maxGlideDays).map((knot) => knot.day);

describe('trendKnotsOf', () => {
  it.each([
    {
      name: 'glides a short flat run into the next drop',
      stocks: [9, 9, 9, 8, 8, 7],
      days: [0, 3, 5],
    },
    {
      name: 'keeps a long flat run flat before its drop',
      stocks: [9, 9, 9, 9, 8],
      days: [0, 3, 4],
    },
    { name: 'turns a delivery into a one-day rise', stocks: [2, 2, 2, 10, 10], days: [0, 2, 3, 4] },
    { name: 'keeps both ends of an unchanged stock', stocks: [5, 5, 5], days: [0, 2] },
    { name: 'keeps the only day', stocks: [5], days: [0] },
  ])('$name', ({ stocks, days }) => {
    expect(daysOf(stocks, 3)).toEqual(days);
  });

  it('carries the recorded stock of every kept day', () => {
    expect(trendKnotsOf([4, 4, 12, 11], 3)).toEqual([
      { day: 0, stock: 4 },
      { day: 1, stock: 4 },
      { day: 2, stock: 12 },
      { day: 3, stock: 11 },
    ]);
  });

  it('draws nothing without days', () => {
    expect(trendKnotsOf([], 3)).toEqual([]);
  });
});

describe('monotoneSegmentsOf', () => {
  const spots = [
    { x: 0, y: 40 },
    { x: 30, y: 40 },
    { x: 33, y: 10 },
    { x: 90, y: 20 },
    { x: 120, y: 30 },
  ];

  it('never bends a segment beyond its own two ends', () => {
    const escapes = monotoneSegmentsOf(spots).filter(({ from, pull, push, to }) => {
      const low = Math.min(from.y, to.y);
      const high = Math.max(from.y, to.y);

      return [pull.y, push.y].some((y) => y < low || y > high);
    });

    expect(escapes).toEqual([]);
  });

  it('flattens the curve at a turning point', () => {
    const [, rise] = monotoneSegmentsOf(spots);

    expect(rise?.push.y).toBe(10);
  });
});

describe('curvePathOf', () => {
  it.each([
    { spots: [], path: '' },
    { spots: [{ x: 4, y: 5 }], path: 'M4 5' },
    {
      spots: [
        { x: 0, y: 10 },
        { x: 30, y: 10 },
      ],
      path: 'M0 10C10 10 20 10 30 10',
    },
  ])('serialises $spots.length spots', ({ spots, path }) => {
    expect(curvePathOf(spots)).toBe(path);
  });
});
