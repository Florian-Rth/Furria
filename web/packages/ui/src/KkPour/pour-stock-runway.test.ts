import { describe, expect, it } from 'vitest';
import { stockRunwayOf } from './pour-stock-runway';

const frame = { scaleDays: 28, edgeShare: 0.12, scaleRoom: 0.3, nowRoom: 0.28 };

describe('stockRunwayOf', () => {
  it.each([
    { stock: 10, forecastDays: 7, reach: 'within', fill: 0.25 },
    { stock: 10, forecastDays: 0, reach: 'within', fill: 0 },
    { stock: 10, forecastDays: 60, reach: 'beyond', fill: 1 },
    { stock: 10, forecastDays: null, reach: 'still', fill: 0 },
    { stock: 0, forecastDays: 3, reach: 'still', fill: 0 },
  ])('fills $forecastDays days of $stock crates', ({ stock, forecastDays, reach, fill }) => {
    expect(stockRunwayOf(stock, forecastDays, frame)).toMatchObject({ reach, fill });
  });

  it('notches every full week inside the scale', () => {
    expect(stockRunwayOf(1, 3, frame).weeks).toEqual([0.25, 0.5, 0.75]);
  });

  it.each([
    { forecastDays: 14, kinds: ['now', 'empty', 'scale'] },
    { forecastDays: 2, kinds: ['empty', 'scale'] },
    { forecastDays: 5, kinds: ['empty', 'scale'] },
    { forecastDays: 26, kinds: ['now', 'empty'] },
    { forecastDays: 40, kinds: ['now', 'beyond'] },
    { forecastDays: null, kinds: ['now', 'scale'] },
  ])('marks a runway of $forecastDays days', ({ forecastDays, kinds }) => {
    expect(stockRunwayOf(10, forecastDays, frame).marks.map((mark) => mark.kind)).toEqual(kinds);
  });

  it.each([
    { forecastDays: 14, align: 'center' },
    { forecastDays: 2, align: 'start' },
    { forecastDays: 26, align: 'end' },
  ])('keeps the empty day of $forecastDays days inside the runway', ({ forecastDays, align }) => {
    const empty = stockRunwayOf(10, forecastDays, frame).marks.find(
      (mark) => mark.kind === 'empty',
    );

    expect(empty?.align).toBe(align);
  });
});
