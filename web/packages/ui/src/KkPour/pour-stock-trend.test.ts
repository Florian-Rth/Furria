import { describe, expect, it } from 'vitest';
import {
  curvePathOf,
  monotoneSegmentsOf,
  stockCurvePlotOf,
  stockModelOf,
  trendKnotsOf,
} from './pour-stock-trend';

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

const frame = { maxForecastDays: 10, headroom: 1.25, nowTickGap: 0.2 };

describe('stockModelOf', () => {
  it('runs the forecast from today down to empty on the projected day', () => {
    expect(stockModelOf([4, 8, 6], 4, frame)).toMatchObject({
      stocks: [4, 8, 6],
      lastDay: 6,
      peak: 10,
      now: { day: 2, stock: 6 },
      end: { day: 6, stock: 0 },
      emptyReached: true,
    });
  });

  it('cuts a far forecast at the horizon on the stock left by then', () => {
    expect(stockModelOf([8, 8], 40, frame)).toMatchObject({
      lastDay: 11,
      end: { day: 11, stock: 6 },
      emptyReached: false,
    });
  });

  it.each([
    ['no projection', null],
    ['an empty projection today', 0],
  ])('draws history only with %s', (_, forecastDays) => {
    expect(stockModelOf([3, 5], forecastDays, frame)).toMatchObject({
      stocks: [3, 5],
      lastDay: 1,
      end: null,
    });
  });

  it('draws no forecast once the stock is gone', () => {
    expect(stockModelOf([3, 0], 5, frame).end).toBeNull();
  });

  it('keeps the history on the floor when the count runs negative', () => {
    expect(stockModelOf([-2, 4], null, frame).stocks).toEqual([0, 4]);
  });

  it.each([
    [
      'today at the right edge without forecast',
      null,
      [
        { kind: 'from', share: 0, align: 'start' },
        { kind: 'now', share: 1, align: 'end' },
      ],
    ],
    [
      'today and the empty day when both fit',
      4,
      [
        { kind: 'from', share: 0, align: 'start' },
        { kind: 'now', share: 0.33, align: 'center' },
        { kind: 'empty', share: 1, align: 'end' },
      ],
    ],
    [
      'the empty day alone when today sits too close',
      0.2,
      [
        { kind: 'from', share: 0, align: 'start' },
        { kind: 'empty', share: 1, align: 'end' },
      ],
    ],
    [
      'today alone when the forecast runs past the horizon',
      40,
      [
        { kind: 'from', share: 0, align: 'start' },
        { kind: 'now', share: 0.17, align: 'center' },
      ],
    ],
  ])('labels %s', (_, forecastDays, ticks) => {
    expect(stockModelOf([5, 5, 5], forecastDays, frame).ticks).toEqual(ticks);
  });
});

describe('stockCurvePlotOf', () => {
  const box = { width: 124, height: 52, inset: 2 };
  const curve = { maxGlideDays: 3, labelGap: 30, labelHalf: 12, labelRoom: 10, lift: 5, glow: 6 };
  const flat = { maxForecastDays: 10, headroom: 1, nowTickGap: 0.2 };
  const stocks = [2, 2, 2, 12, 11, 10, 10, 10, 15, 14, 13, 12, 10];
  const plotOf = (deliveries: readonly number[], values: readonly number[] = stocks) =>
    stockCurvePlotOf(stockModelOf(values, null, flat), deliveries, box, curve);

  it('labels each delivery above its rise and marks the rise on the curve', () => {
    const plot = plotOf([0, 0, 0, 10, 0, 0, 0, 0, 5]);

    expect({ top: plot.top, marks: plot.marks, labels: plot.labels }).toEqual({
      top: 12,
      marks: [
        { day: 3, x: 32, y: 19.6 },
        { day: 8, x: 82, y: 12 },
      ],
      labels: [
        { day: 3, crates: 10, x: 32, y: 14.6 },
        { day: 8, crates: 5, x: 82, y: 7 },
      ],
    });
  });

  it('merges deliveries closer than the label gap into one sum above the higher rise', () => {
    const plot = plotOf([0, 0, 0, 10, 0, 6]);

    expect({ marks: plot.marks.length, labels: plot.labels }).toEqual({
      marks: 2,
      labels: [{ day: 3, crates: 16, x: 32, y: 14.6 }],
    });
  });

  it('keeps a label on the first day inside the plot', () => {
    expect(plotOf([4], [4, 3, 3]).labels[0]?.x).toBe(14);
  });

  it('lifts a delivery of today above the today glow and leaves the today dot unmarked', () => {
    const plot = plotOf([0, 0, 3], [4, 4, 7]);

    expect({ marks: plot.marks, labels: plot.labels }).toEqual({
      marks: [],
      labels: [{ day: 2, crates: 3, x: 110, y: 6 }],
    });
  });

  it('reserves no label room and labels nothing without past deliveries', () => {
    expect(plotOf([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3])).toMatchObject({
      top: 2,
      marks: [],
      labels: [],
    });
  });
});
