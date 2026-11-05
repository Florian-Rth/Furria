export type KkPourStockBarKind = 'past' | 'delivery' | 'today' | 'ahead' | 'idle';

export interface KkPourStockBar {
  day: number;
  kind: KkPourStockBarKind;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

export interface KkPourStockBarLabel {
  day: number;
  crates: number;
  x: number;
  y: number;
}

export interface KkPourStockBarsPlot {
  bars: readonly KkPourStockBar[];
  labels: readonly KkPourStockBarLabel[];
  floor: number;
  left: number;
  right: number;
  todayX: number;
  endX: number | null;
  hasForecast: boolean;
}

export interface KkPourStockBarsFrame {
  maxForecastDays: number;
  headroom: number;
  maxGap: number;
  minBar: number;
  stub: number;
  maxRadius: number;
  labelGap: number;
}

export interface KkPourStockBarsBox {
  width: number;
  height: number;
  top: number;
}

const round = (value: number): number => Math.round(value * 100) / 100;

export const aheadStocksOf = (
  stock: number,
  forecastDays: number | null,
  maxForecastDays: number,
): readonly number[] => {
  if (forecastDays === null || forecastDays <= 0 || stock <= 0) {
    return [];
  }

  const horizon = Math.min(Math.ceil(forecastDays), maxForecastDays);

  return Array.from({ length: horizon }, (_, index) =>
    Math.max(0, Math.round(stock * (1 - (index + 1) / forecastDays))),
  );
};

const kindOf = (
  stock: number,
  day: number,
  nowDay: number,
  delivered: number,
): KkPourStockBarKind => {
  if (stock <= 0) {
    return 'idle';
  }
  if (day > nowDay) {
    return 'ahead';
  }
  if (day === nowDay) {
    return 'today';
  }

  return delivered > 0 ? 'delivery' : 'past';
};

const spacedLabelsOf = (
  labels: readonly KkPourStockBarLabel[],
  labelGap: number,
): readonly KkPourStockBarLabel[] => {
  const kept: KkPourStockBarLabel[] = [];

  for (const label of labels) {
    const previous = kept.at(-1);

    if (previous === undefined || label.x - previous.x >= labelGap) {
      kept.push(label);
    }
  }

  return kept;
};

export const stockBarsPlotOf = (
  stocks: readonly number[],
  deliveries: readonly number[],
  forecastDays: number | null,
  box: KkPourStockBarsBox,
  frame: KkPourStockBarsFrame,
): KkPourStockBarsPlot => {
  const past = stocks.map((stock) => Math.max(0, stock));
  const nowDay = Math.max(0, past.length - 1);
  const ahead = aheadStocksOf(past.at(-1) ?? 0, forecastDays, frame.maxForecastDays);
  const all = [...past, ...ahead];
  const column = all.length === 0 ? box.width : box.width / all.length;
  const gap = Math.min(frame.maxGap, column * 0.4);
  const width = round(Math.max(frame.minBar, column - gap));
  const radius = round(Math.min(width / 2, frame.maxRadius));
  const peak = Math.max(1, ...past) * frame.headroom;
  const floor = box.height;
  const reach = box.height - box.top;
  const centerOf = (day: number): number => round(day * column + column / 2);

  const bars = all.map((stock, day): KkPourStockBar => {
    const kind = kindOf(stock, day, nowDay, deliveries[day] ?? 0);
    const height = round(kind === 'idle' ? frame.stub : Math.max(width, (stock / peak) * reach));

    return {
      day,
      kind,
      x: round(centerOf(day) - width / 2),
      y: round(floor - height),
      width,
      height,
      radius,
    };
  });

  const labels = bars.flatMap((bar): readonly KkPourStockBarLabel[] => {
    const crates = deliveries[bar.day] ?? 0;

    return bar.day <= nowDay && crates > 0
      ? [{ day: bar.day, crates, x: centerOf(bar.day), y: bar.y }]
      : [];
  });

  return {
    bars,
    labels: spacedLabelsOf(labels, frame.labelGap),
    floor,
    left: 0,
    right: box.width,
    todayX: centerOf(nowDay),
    hasForecast: ahead.length > 0,
    endX: ahead.length === 0 || (ahead.at(-1) ?? 0) > 0 ? null : centerOf(all.length - 1),
  };
};

export const barPathOf = (bar: KkPourStockBar): string => {
  const radius = Math.min(bar.radius, bar.height);
  const floor = round(bar.y + bar.height);
  const right = round(bar.x + bar.width);
  const shoulder = round(bar.y + radius);
  const top = `Q${bar.x} ${bar.y} ${round(bar.x + radius)} ${bar.y}H${round(right - radius)}`;

  return `M${bar.x} ${floor}V${shoulder}${top}Q${right} ${bar.y} ${right} ${shoulder}V${floor}Z`;
};

export interface KkPourStockBarTick {
  kind: 'from' | 'now' | 'empty';
  share: number;
  align: 'start' | 'center' | 'end';
}

export const barTicksOf = (
  plot: KkPourStockBarsPlot,
  nowTickGap: number,
): readonly KkPourStockBarTick[] => {
  const width = plot.right - plot.left;
  const from: KkPourStockBarTick = { kind: 'from', share: 0, align: 'start' };

  if (!plot.hasForecast) {
    return [from, { kind: 'now', share: 1, align: 'end' }];
  }

  const nowShare = width === 0 ? 1 : round((plot.todayX - plot.left) / width);
  const now: readonly KkPourStockBarTick[] =
    1 - nowShare >= nowTickGap ? [{ kind: 'now', share: nowShare, align: 'center' }] : [];
  const empty: readonly KkPourStockBarTick[] =
    plot.endX === null ? [] : [{ kind: 'empty', share: 1, align: 'end' }];

  return [from, ...now, ...empty];
};
