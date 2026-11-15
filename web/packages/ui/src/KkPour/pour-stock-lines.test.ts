import { describe, expect, it } from 'vitest';
import { stockLinesPlotOf, stockLinesTicksOf } from './pour-stock-lines';

const FRAME = { maxForecastDays: 28, headroom: 1, maxGlideDays: 6, nowTickGap: 0.24 };
const BOX = { width: 120, height: 60, inset: 10 };

describe('stockLinesPlotOf', () => {
  it.each([
    {
      name: 'scales every line against the highest stock and the farthest forecast',
      series: [
        { values: [10, 10, 10], forecastDays: 2 },
        { values: [5, 5, 5], forecastDays: null },
      ],
      expected: {
        nowX: 60,
        right: 110,
        lines: [
          { now: { x: 60, y: 10 }, ahead: 'M60 10L110 50', empty: { x: 110, y: 50 } },
          { now: { x: 60, y: 30 }, ahead: null, empty: null },
        ],
      },
    },
    {
      name: 'clips a far forecast at the horizon without an empty mark',
      series: [{ values: [8, 8], forecastDays: 56 }],
      expected: {
        nowX: 13.45,
        right: 110,
        lines: [{ now: { x: 13.45, y: 10 }, ahead: 'M13.45 10L110 30', empty: null }],
      },
    },
    {
      name: 'an empty drink projects nothing',
      series: [{ values: [3, 0], forecastDays: 4 }],
      expected: {
        nowX: 110,
        right: 110,
        lines: [{ now: { x: 110, y: 50 }, ahead: null, empty: null }],
      },
    },
  ])('$name', ({ series, expected }) => {
    const plot = stockLinesPlotOf(series, BOX, FRAME);

    expect({
      nowX: plot.nowX,
      right: plot.right,
      lines: plot.lines.map(({ now, ahead, empty }) => ({ now, ahead, empty })),
    }).toEqual(expected);
  });
});

describe('stockLinesTicksOf', () => {
  it.each([
    {
      name: 'no forecast puts today at the end',
      forecastDays: null,
      expected: { nowShare: 1, showNow: true },
    },
    {
      name: 'a long forecast keeps the today tick',
      forecastDays: 2,
      expected: { nowShare: 0.5, showNow: true },
    },
    {
      name: 'a short forecast hides a crowded today tick',
      forecastDays: 0.2,
      expected: { nowShare: 0.91, showNow: false },
    },
  ])('$name', ({ forecastDays, expected }) => {
    expect(stockLinesTicksOf([{ values: [4, 4, 4], forecastDays }], FRAME)).toEqual(expected);
  });
});
