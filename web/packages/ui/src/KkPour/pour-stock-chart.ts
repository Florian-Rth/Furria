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
  stocks: readonly number[];
  lastDay: number;
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
  const lastDay = end?.day ?? nowDay;
  const nowShare = lastDay === 0 ? 1 : round(nowDay / lastDay);

  return {
    stocks,
    lastDay,
    peak: Math.max(1, ...stocks) * frame.headroom,
    now,
    end,
    emptyReached,
    ticks: ticksOf(nowShare, hasForecast, emptyReached, frame),
  };
};

export interface KkPourStockBox {
  width: number;
  height: number;
  inset: number;
}

export interface KkPourStockSpot {
  x: number;
  y: number;
}

export interface KkPourStockPlot {
  line: string;
  area: string;
  forecast: string | null;
  left: number;
  right: number;
  top: number;
  floor: number;
  now: KkPourStockSpot;
  todayRule: number | null;
  empty: KkPourStockSpot | null;
}

const spotOf =
  (model: KkPourStockModel, box: KkPourStockBox) =>
  (point: KkPourStockPoint): KkPourStockSpot => {
    const span = model.lastDay === 0 ? 1 : model.lastDay;
    const width = Math.max(0, box.width - 2 * box.inset);
    const height = Math.max(0, box.height - 2 * box.inset);

    return {
      x: round(box.inset + (point.day / span) * width),
      y: round(box.inset + (1 - point.stock / model.peak) * height),
    };
  };

const stepsOf = (spots: readonly KkPourStockSpot[]): string =>
  spots
    .map((spot, index) => {
      const previous = spots[index - 1];

      return previous === undefined
        ? `M${spot.x} ${spot.y}`
        : `H${spot.x}${spot.y === previous.y ? '' : `V${spot.y}`}`;
    })
    .join('');

export const stockPlotOf = (model: KkPourStockModel, box: KkPourStockBox): KkPourStockPlot => {
  const spot = spotOf(model, box);
  const spots = model.stocks.map((stock, day) => spot({ day, stock }));
  const floor = spot({ day: 0, stock: 0 });
  const right = spot({ day: model.lastDay === 0 ? 1 : model.lastDay, stock: 0 }).x;
  const now = spot(model.now);
  const end = model.end === null ? null : spot(model.end);
  const line = stepsOf(spots);

  return {
    line,
    area: line === '' ? '' : `${line}V${floor.y}H${floor.x}Z`,
    forecast: end === null ? null : `M${now.x} ${now.y}L${end.x} ${end.y}`,
    left: floor.x,
    right,
    top: box.inset,
    floor: floor.y,
    now,
    todayRule: end === null ? null : now.x,
    empty: model.emptyReached ? end : null,
  };
};

export const svgIdOf = (reactId: string): string =>
  `kk-pour-stock-${reactId.replace(/[^A-Za-z0-9_-]/g, '')}`;
