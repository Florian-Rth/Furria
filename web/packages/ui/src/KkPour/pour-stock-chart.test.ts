import { describe, expect, it } from 'vitest';
import { stockModelOf, stockPlotOf } from './pour-stock-chart';

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

describe('stockPlotOf', () => {
  const box = { width: 124, height: 54, inset: 2 };

  it('steps the history to today and dots the forecast down to the empty ring', () => {
    expect(stockPlotOf(stockModelOf([4, 8, 6], 4, frame), box)).toEqual({
      line: 'M2 32H22V12H42V22',
      area: 'M2 32H22V12H42V22V52H2Z',
      forecast: 'M42 22L122 52',
      left: 2,
      right: 122,
      top: 2,
      floor: 52,
      now: { x: 42, y: 22 },
      todayRule: 42,
      empty: { x: 122, y: 52 },
    });
  });

  it('holds a flat stretch as one horizontal run', () => {
    expect(stockPlotOf(stockModelOf([5, 5, 5], null, frame), box).line).toBe('M2 12H62H122');
  });

  it('ends the forecast without a ring when it runs past the horizon', () => {
    expect(stockPlotOf(stockModelOf([8, 8], 40, frame), box)).toMatchObject({
      forecast: 'M12.91 12L122 22',
      empty: null,
    });
  });

  it('marks no today rule without a forecast', () => {
    expect(stockPlotOf(stockModelOf([3, 5], null, frame), box)).toMatchObject({
      forecast: null,
      todayRule: null,
      empty: null,
      right: 122,
    });
  });

  it('places a single count on the left edge', () => {
    expect(stockPlotOf(stockModelOf([2], null, frame), box)).toMatchObject({
      line: 'M2 12',
      now: { x: 2, y: 12 },
    });
  });
});
