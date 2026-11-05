import { describe, expect, it } from 'vitest';
import { aheadStocksOf, barPathOf, barTicksOf, stockBarsPlotOf } from './pour-stock-bars';

const frame = {
  maxForecastDays: 4,
  headroom: 1,
  maxGap: 2,
  minBar: 1,
  stub: 1,
  maxRadius: 2,
  labelGap: 25,
};
const box = { width: 100, height: 50, top: 10 };

describe('aheadStocksOf', () => {
  it.each([
    { stock: 6, forecastDays: 3, ahead: [4, 2, 0] },
    { stock: 5, forecastDays: 2.5, ahead: [3, 1, 0] },
    { stock: 8, forecastDays: 40, ahead: [8, 8, 7, 7] },
    { stock: 6, forecastDays: null, ahead: [] },
    { stock: 0, forecastDays: 3, ahead: [] },
  ])('projects $stock crates over $forecastDays days', ({ stock, forecastDays, ahead }) => {
    expect(aheadStocksOf(stock, forecastDays, frame.maxForecastDays)).toEqual(ahead);
  });
});

describe('stockBarsPlotOf', () => {
  const plot = stockBarsPlotOf([0, 8, 6, 4], [0, 8, 0, 0], 2, box, frame);

  it('tells every day what it is', () => {
    expect(plot.bars.map((bar) => bar.kind)).toEqual([
      'idle',
      'delivery',
      'past',
      'today',
      'ahead',
      'idle',
    ]);
  });

  it('stands every bar on the floor at its share of the peak', () => {
    expect(plot.bars.map((bar) => bar.y + bar.height)).toEqual([50, 50, 50, 50, 50, 50]);
    expect(plot.bars[1]?.height).toBe(40);
    expect(plot.bars[3]?.height).toBe(20);
  });

  it('labels a delivery above its bar and marks the empty day', () => {
    expect(plot.labels).toEqual([{ day: 1, crates: 8, x: 25, y: 10 }]);
    expect(plot.endX).toBeCloseTo(91.67);
  });

  it('drops a delivery label that would crowd the previous one', () => {
    const crowded = stockBarsPlotOf([4, 8, 12], [4, 4, 4], null, box, {
      ...frame,
      labelGap: 40,
    });

    expect(crowded.labels.map((label) => label.day)).toEqual([0, 2]);
  });

  it('marks no empty day when the forecast runs past the horizon', () => {
    expect(stockBarsPlotOf([8], [0], 40, box, frame).endX).toBeNull();
  });
});

describe('barPathOf', () => {
  it.each([
    {
      name: 'rounds the top corners of a tall bar',
      bar: { day: 0, kind: 'past', x: 0, y: 10, width: 4, height: 20, radius: 2 },
      path: 'M0 30V12Q0 10 2 10H2Q4 10 4 12V30Z',
    },
    {
      name: 'keeps a stub inside its own height',
      bar: { day: 0, kind: 'idle', x: 0, y: 29, width: 4, height: 1, radius: 2 },
      path: 'M0 30V30Q0 29 1 29H3Q4 29 4 30V30Z',
    },
  ] as const)('$name', ({ bar, path }) => {
    expect(barPathOf(bar)).toBe(path);
  });
});

describe('barTicksOf', () => {
  const plotOf = (todayX: number, endX: number | null, hasForecast: boolean) => ({
    bars: [],
    labels: [],
    floor: 50,
    left: 0,
    right: 100,
    todayX,
    endX,
    hasForecast,
  });

  it.each([
    { todayX: 99, endX: null, forecast: false, kinds: ['from', 'now'] },
    { todayX: 60, endX: 99, forecast: true, kinds: ['from', 'now', 'empty'] },
    { todayX: 90, endX: 99, forecast: true, kinds: ['from', 'empty'] },
    { todayX: 60, endX: null, forecast: true, kinds: ['from', 'now'] },
  ])('labels today at $todayX and the end at $endX', ({ todayX, endX, forecast, kinds }) => {
    expect(barTicksOf(plotOf(todayX, endX, forecast), 0.24).map((tick) => tick.kind)).toEqual(
      kinds,
    );
  });
});
