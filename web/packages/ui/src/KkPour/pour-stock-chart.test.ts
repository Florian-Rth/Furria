import { describe, expect, it } from 'vitest';
import { stockModelOf } from './pour-stock-chart';

const frame = { maxForecastDays: 10, headroom: 1.25, nowTickGap: 0.2 };

describe('stockModelOf', () => {
  it('runs the forecast from today down to empty on the projected day', () => {
    expect(stockModelOf([4, 8, 6], 4, frame)).toMatchObject({
      days: [0, 1, 2, 6],
      history: [4, 8, 6, null],
      forecast: [null, null, 6, 0],
      peak: 10,
      now: { day: 2, stock: 6 },
      end: { day: 6, stock: 0 },
      emptyReached: true,
    });
  });

  it('cuts a far forecast at the horizon on the stock left by then', () => {
    expect(stockModelOf([8, 8], 40, frame)).toMatchObject({
      days: [0, 1, 11],
      end: { day: 11, stock: 6 },
      emptyReached: false,
    });
  });

  it.each([
    ['no projection', null],
    ['an empty projection today', 0],
  ])('draws history only with %s', (_, forecastDays) => {
    expect(stockModelOf([3, 5], forecastDays, frame)).toMatchObject({
      days: [0, 1],
      history: [3, 5],
      forecast: [],
      end: null,
    });
  });

  it('draws no forecast once the stock is gone', () => {
    expect(stockModelOf([3, 0], 5, frame).end).toBeNull();
  });

  it('keeps the history on the floor when the count runs negative', () => {
    expect(stockModelOf([-2, 4], null, frame).history).toEqual([0, 4]);
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
