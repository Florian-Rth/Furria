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
  top: number;
}

export interface KkPourStockSpot {
  x: number;
  y: number;
}

export const spotOf =
  (model: KkPourStockModel, box: KkPourStockBox) =>
  (point: KkPourStockPoint): KkPourStockSpot => {
    const span = model.lastDay === 0 ? 1 : model.lastDay;
    const width = Math.max(0, box.width - 2 * box.inset);
    const height = Math.max(0, box.height - box.top - box.inset);

    return {
      x: round(box.inset + (point.day / span) * width),
      y: round(box.top + (1 - point.stock / model.peak) * height),
    };
  };

export const svgIdOf = (reactId: string): string =>
  `kk-pour-stock-${reactId.replace(/[^A-Za-z0-9_-]/g, '')}`;

const keptDaysOf = (
  stocks: readonly number[],
  maxGlideDays: number,
  pinned: readonly number[],
): ReadonlySet<number> => {
  const kept = new Set<number>([0, Math.max(0, stocks.length - 1), ...pinned]);
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
  pinned: readonly number[] = [],
): readonly KkPourStockPoint[] =>
  stocks.length === 0
    ? []
    : [
        ...keptDaysOf(
          stocks,
          maxGlideDays,
          pinned.filter((day) => day < stocks.length),
        ),
      ]
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

export interface KkPourDeliveryFrame {
  labelGap: number;
  labelHalf: number;
  labelRoom: number;
  lift: number;
  glow: number;
}

export interface KkPourDeliveryMark {
  day: number;
  x: number;
  y: number;
}

export interface KkPourDeliveryLabel {
  day: number;
  crates: number;
  x: number;
  y: number;
}

export const deliveryDaysOf = (deliveries: readonly number[], nowDay: number): readonly number[] =>
  deliveries.flatMap((crates, day) => (crates > 0 && day <= nowDay ? [day] : []));

const clamp = (value: number, low: number, high: number): number =>
  low > high ? (low + high) / 2 : Math.min(high, Math.max(low, value));

const mergedLabelsOf = (
  marks: readonly KkPourDeliveryMark[],
  deliveries: readonly number[],
  edges: { left: number; right: number },
  frame: KkPourDeliveryFrame,
): readonly KkPourDeliveryLabel[] => {
  const labels: KkPourDeliveryLabel[] = [];

  for (const mark of marks) {
    const crates = deliveries[mark.day] ?? 0;
    const x = round(clamp(mark.x, edges.left + frame.labelHalf, edges.right - frame.labelHalf));
    const previous = labels.at(-1);

    if (previous !== undefined && x - previous.x < frame.labelGap) {
      labels[labels.length - 1] = {
        ...previous,
        crates: previous.crates + crates,
        y: Math.min(previous.y, mark.y),
      };
    } else {
      labels.push({ day: mark.day, crates, x, y: mark.y });
    }
  }

  return labels;
};

const clearOfGlow = (
  label: KkPourDeliveryLabel,
  now: KkPourStockSpot,
  frame: KkPourDeliveryFrame,
): KkPourDeliveryLabel => {
  const above = round(label.y - frame.lift);
  const nearToday = Math.abs(label.x - now.x) < frame.labelHalf + frame.glow;

  return { ...label, y: nearToday ? Math.min(above, round(now.y - frame.glow)) : above };
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
  marks: readonly KkPourDeliveryMark[];
  labels: readonly KkPourDeliveryLabel[];
}

export interface KkPourStockCurveFrame extends KkPourDeliveryFrame {
  maxGlideDays: number;
}

export const stockCurvePlotOf = (
  model: KkPourStockModel,
  deliveries: readonly number[],
  box: Omit<KkPourStockBox, 'top'>,
  frame: KkPourStockCurveFrame,
): KkPourStockCurvePlot => {
  const deliveryDays = deliveryDaysOf(deliveries, model.now.day);
  const top = deliveryDays.length === 0 ? box.inset : box.inset + frame.labelRoom;
  const spot = spotOf(model, { ...box, top });
  const spots = trendKnotsOf(model.stocks, frame.maxGlideDays, deliveryDays).map(spot);
  const floor = spot({ day: 0, stock: 0 });
  const right = spot({ day: model.lastDay === 0 ? 1 : model.lastDay, stock: 0 }).x;
  const now = spot(model.now);
  const end = model.end === null ? null : spot(model.end);
  const line = curvePathOf(spots);
  const last = spots.at(-1) ?? floor;
  const rises = deliveryDays.map((day) => ({
    day,
    ...spot({ day, stock: model.stocks[day] ?? 0 }),
  }));
  const labels = mergedLabelsOf(rises, deliveries, { left: floor.x, right }, frame).map((label) =>
    clearOfGlow(label, now, frame),
  );

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
    top,
    floor: floor.y,
    now,
    empty: model.emptyReached ? end : null,
    marks: rises.filter((rise) => Math.hypot(rise.x - now.x, rise.y - now.y) >= frame.glow),
    labels,
  };
};
