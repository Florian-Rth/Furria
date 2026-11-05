import type {
  KkPourStockBox,
  KkPourStockModel,
  KkPourStockPoint,
  KkPourStockSpot,
} from './pour-stock-chart';
import { spotOf } from './pour-stock-chart';

const round = (value: number): number => Math.round(value * 100) / 100;

const keptDaysOf = (stocks: readonly number[], maxGlideDays: number): ReadonlySet<number> => {
  const kept = new Set<number>([0, Math.max(0, stocks.length - 1)]);
  let runStart = 0;

  stocks.forEach((stock, day) => {
    const previous = stocks[day - 1];

    if (previous === undefined || previous === stock) {
      return;
    }
    if (stock > previous || day - 1 - runStart >= maxGlideDays) {
      kept.add(day - 1);
    }

    kept.add(day);
    runStart = day;
  });

  return kept;
};

export const trendKnotsOf = (
  stocks: readonly number[],
  maxGlideDays: number,
): readonly KkPourStockPoint[] =>
  stocks.length === 0
    ? []
    : [...keptDaysOf(stocks, maxGlideDays)]
        .sort((left, right) => left - right)
        .map((day) => ({ day, stock: stocks[day] ?? 0 }));

export interface KkPourCurveSegment {
  from: KkPourStockSpot;
  pull: KkPourStockSpot;
  push: KkPourStockSpot;
  to: KkPourStockSpot;
}

const slopeBetween = (from: KkPourStockSpot, to: KkPourStockSpot): number =>
  to.x === from.x ? 0 : (to.y - from.y) / (to.x - from.x);

const tangentAt = (spots: readonly KkPourStockSpot[], index: number): number => {
  const previous = spots[index - 1];
  const current = spots[index];
  const next = spots[index + 1];

  if (current === undefined) {
    return 0;
  }
  if (previous === undefined) {
    return next === undefined ? 0 : slopeBetween(current, next);
  }
  if (next === undefined) {
    return slopeBetween(previous, current);
  }

  const before = slopeBetween(previous, current);
  const after = slopeBetween(current, next);

  if (before * after <= 0) {
    return 0;
  }

  const spanBefore = current.x - previous.x;
  const spanAfter = next.x - current.x;
  const blended = (before * spanAfter + after * spanBefore) / (spanBefore + spanAfter);

  return Math.sign(before) * Math.min(Math.abs(before), Math.abs(after), Math.abs(blended) / 2) * 2;
};

export const monotoneSegmentsOf = (
  spots: readonly KkPourStockSpot[],
): readonly KkPourCurveSegment[] => {
  const tangents = spots.map((_, index) => tangentAt(spots, index));

  return spots.slice(1).map((to, index) => {
    const from = spots[index] ?? to;
    const third = (to.x - from.x) / 3;

    return {
      from,
      pull: { x: round(from.x + third), y: round(from.y + (tangents[index] ?? 0) * third) },
      push: { x: round(to.x - third), y: round(to.y - (tangents[index + 1] ?? 0) * third) },
      to,
    };
  });
};

export const curvePathOf = (spots: readonly KkPourStockSpot[]): string => {
  const first = spots[0];

  if (first === undefined) {
    return '';
  }

  const curves = monotoneSegmentsOf(spots)
    .map(({ pull, push, to }) => `C${pull.x} ${pull.y} ${push.x} ${push.y} ${to.x} ${to.y}`)
    .join('');

  return `M${first.x} ${first.y}${curves}`;
};

export interface KkPourStockCurvePlot {
  line: string;
  area: string;
  forecastLine: string | null;
  forecastBand: string | null;
  left: number;
  right: number;
  top: number;
  floor: number;
  now: KkPourStockSpot;
  empty: KkPourStockSpot | null;
}

export const stockCurvePlotOf = (
  model: KkPourStockModel,
  box: KkPourStockBox,
  maxGlideDays: number,
): KkPourStockCurvePlot => {
  const spot = spotOf(model, box);
  const spots = trendKnotsOf(model.stocks, maxGlideDays).map(spot);
  const floor = spot({ day: 0, stock: 0 });
  const right = spot({ day: model.lastDay === 0 ? 1 : model.lastDay, stock: 0 }).x;
  const now = spot(model.now);
  const end = model.end === null ? null : spot(model.end);
  const line = curvePathOf(spots);
  const last = spots.at(-1) ?? floor;

  return {
    line,
    area: line === '' ? '' : `${line}L${last.x} ${floor.y}L${floor.x} ${floor.y}Z`,
    forecastLine: end === null ? null : `M${now.x} ${now.y}L${end.x} ${end.y}`,
    forecastBand:
      end === null
        ? null
        : `M${now.x} ${now.y}L${end.x} ${end.y}L${end.x} ${floor.y}L${now.x} ${floor.y}Z`,
    left: floor.x,
    right,
    top: box.inset,
    floor: floor.y,
    now,
    empty: model.emptyReached ? end : null,
  };
};
