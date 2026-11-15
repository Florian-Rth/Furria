import type { KkPourStockPoint, KkPourStockSpot } from './pour-stock-trend';
import { curvePathOf, trendKnotsOf } from './pour-stock-trend';

export interface KkPourStockSeries {
  values: readonly number[];
  forecastDays: number | null;
}

export interface KkPourStockLinesFrame {
  maxForecastDays: number;
  headroom: number;
  maxGlideDays: number;
  nowTickGap: number;
}

export interface KkPourStockLinesBox {
  width: number;
  height: number;
  inset: number;
}

export interface KkPourStockLinePlot {
  line: string;
  ahead: string | null;
  now: KkPourStockSpot;
  empty: KkPourStockSpot | null;
}

export interface KkPourStockLinesPlot {
  left: number;
  right: number;
  top: number;
  floor: number;
  nowX: number;
  hasForecast: boolean;
  lines: readonly KkPourStockLinePlot[];
}

export interface KkPourStockLinesTicks {
  nowShare: number;
  showNow: boolean;
}

interface SeriesModel {
  stocks: readonly number[];
  now: KkPourStockPoint;
  end: KkPourStockPoint | null;
  emptyReached: boolean;
}

const round = (value: number): number => Math.round(value * 100) / 100;

const seriesModelOf = (
  series: KkPourStockSeries,
  nowDay: number,
  frame: KkPourStockLinesFrame,
): SeriesModel => {
  const stocks = series.values.map((value) => Math.max(0, value));
  const now = { day: nowDay, stock: stocks.at(-1) ?? 0 };
  const { forecastDays } = series;
  const hasForecast = forecastDays !== null && forecastDays > 0 && now.stock > 0;

  if (!hasForecast) {
    return { stocks, now, end: null, emptyReached: false };
  }

  const horizon = Math.min(forecastDays, frame.maxForecastDays);
  const emptyReached = forecastDays <= frame.maxForecastDays;

  return {
    stocks,
    now,
    end: {
      day: round(nowDay + horizon),
      stock: emptyReached ? 0 : round(now.stock * (1 - horizon / forecastDays)),
    },
    emptyReached,
  };
};

const nowDayOf = (series: readonly KkPourStockSeries[]): number =>
  Math.max(0, ...series.map((entry) => entry.values.length - 1));

const modelsOf = (
  series: readonly KkPourStockSeries[],
  frame: KkPourStockLinesFrame,
): readonly SeriesModel[] => {
  const nowDay = nowDayOf(series);

  return series.map((entry) => seriesModelOf(entry, nowDay, frame));
};

const lastDayOf = (models: readonly SeriesModel[], nowDay: number): number =>
  Math.max(nowDay, ...models.map((model) => model.end?.day ?? nowDay));

export const stockLinesTicksOf = (
  series: readonly KkPourStockSeries[],
  frame: KkPourStockLinesFrame,
): KkPourStockLinesTicks => {
  const nowDay = nowDayOf(series);
  const lastDay = lastDayOf(modelsOf(series, frame), nowDay);
  const nowShare = lastDay === 0 ? 1 : round(nowDay / lastDay);

  return { nowShare, showNow: nowShare === 1 || 1 - nowShare >= frame.nowTickGap };
};

export const stockLinesPlotOf = (
  series: readonly KkPourStockSeries[],
  box: KkPourStockLinesBox,
  frame: KkPourStockLinesFrame,
): KkPourStockLinesPlot => {
  const nowDay = nowDayOf(series);
  const models = modelsOf(series, frame);
  const lastDay = lastDayOf(models, nowDay);
  const span = lastDay === 0 ? 1 : lastDay;
  const peak = Math.max(1, ...models.flatMap((model) => model.stocks)) * frame.headroom;
  const width = Math.max(0, box.width - 2 * box.inset);
  const height = Math.max(0, box.height - 2 * box.inset);
  const spot = (point: KkPourStockPoint): KkPourStockSpot => ({
    x: round(box.inset + (point.day / span) * width),
    y: round(box.inset + (1 - point.stock / peak) * height),
  });
  const floor = spot({ day: 0, stock: 0 });

  return {
    left: floor.x,
    right: spot({ day: span, stock: 0 }).x,
    top: box.inset,
    floor: floor.y,
    nowX: spot({ day: nowDay, stock: 0 }).x,
    hasForecast: models.some((model) => model.end !== null),
    lines: models.map((model) => {
      const now = spot(model.now);
      const end = model.end === null ? null : spot(model.end);

      return {
        line: curvePathOf(trendKnotsOf(model.stocks, frame.maxGlideDays).map(spot)),
        ahead: end === null ? null : `M${now.x} ${now.y}L${end.x} ${end.y}`,
        now,
        empty: model.emptyReached ? end : null,
      };
    }),
  };
};
