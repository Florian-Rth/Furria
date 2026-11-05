export interface KkPourStockFrame {
  maxForecastDays: number;
  headroom: number;
  nowTickGap: number;
}

export interface KkPourStockPoint {
  day: number;
  stock: number;
}

export type KkPourStockTickKind = 'from' | 'now' | 'empty';

export type KkPourStockTickAlign = 'start' | 'center' | 'end';

export interface KkPourStockTick {
  kind: KkPourStockTickKind;
  share: number;
  align: KkPourStockTickAlign;
}

export interface KkPourStockModel {
  days: readonly number[];
  history: readonly (number | null)[];
  forecast: readonly (number | null)[];
  peak: number;
  now: KkPourStockPoint;
  end: KkPourStockPoint | null;
  emptyReached: boolean;
  ticks: readonly KkPourStockTick[];
}

const round = (value: number): number => Math.round(value * 100) / 100;

const ticksOf = (
  nowShare: number,
  hasForecast: boolean,
  emptyReached: boolean,
  frame: KkPourStockFrame,
): readonly KkPourStockTick[] => {
  const from: KkPourStockTick = { kind: 'from', share: 0, align: 'start' };

  if (!hasForecast) {
    return [from, { kind: 'now', share: 1, align: 'end' }];
  }

  const now: readonly KkPourStockTick[] =
    1 - nowShare >= frame.nowTickGap ? [{ kind: 'now', share: nowShare, align: 'center' }] : [];
  const empty: readonly KkPourStockTick[] = emptyReached
    ? [{ kind: 'empty', share: 1, align: 'end' }]
    : [];

  return [from, ...now, ...empty];
};

export const stockModelOf = (
  values: readonly number[],
  forecastDays: number | null,
  frame: KkPourStockFrame,
): KkPourStockModel => {
  const stocks = values.map((value) => Math.max(0, value));
  const nowDay = Math.max(0, stocks.length - 1);
  const now = { day: nowDay, stock: stocks.at(-1) ?? 0 };
  const hasForecast = forecastDays !== null && forecastDays > 0 && now.stock > 0;
  const horizon = hasForecast ? Math.min(forecastDays, frame.maxForecastDays) : 0;
  const emptyReached = hasForecast && forecastDays <= frame.maxForecastDays;
  const end = hasForecast
    ? {
        day: round(nowDay + horizon),
        stock: emptyReached ? 0 : round(now.stock * (1 - horizon / forecastDays)),
      }
    : null;
  const historyDays = stocks.map((_, index) => index);
  const lastDay = end?.day ?? nowDay;
  const nowShare = lastDay === 0 ? 1 : round(nowDay / lastDay);

  return {
    days: end === null ? historyDays : [...historyDays, end.day],
    history: end === null ? stocks : [...stocks, null],
    forecast:
      end === null
        ? []
        : [...stocks.map((_, index) => (index === nowDay ? now.stock : null)), end.stock],
    peak: Math.max(1, ...stocks) * frame.headroom,
    now,
    end,
    emptyReached,
    ticks: ticksOf(nowShare, hasForecast, emptyReached, frame),
  };
};

export const svgIdOf = (reactId: string): string =>
  `kk-pour-stock-${reactId.replace(/[^A-Za-z0-9_-]/g, '')}`;
