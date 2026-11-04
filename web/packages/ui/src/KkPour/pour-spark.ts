export interface KkPourSparkPoint {
  x: number;
  y: number;
}

export interface KkPourSparkGeometry {
  history: string;
  area: string;
  forecast: string | null;
  now: KkPourSparkPoint;
  empty: KkPourSparkPoint | null;
}

export interface KkPourSparkFrame {
  width: number;
  height: number;
  pad: number;
  maxForecastSteps: number;
}

const round = (value: number): number => Math.round(value * 10) / 10;

const pathOf = (points: readonly KkPourSparkPoint[]): string =>
  points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');

export const sparkGeometryOf = (
  values: readonly number[],
  forecastSteps: number | null,
  frame: KkPourSparkFrame,
): KkPourSparkGeometry => {
  const steps = forecastSteps === null ? 0 : Math.min(forecastSteps, frame.maxForecastSteps);
  const span = Math.max(1, values.length - 1 + steps);
  const peak = Math.max(1, ...values);
  const innerWidth = frame.width - frame.pad * 2;
  const innerHeight = frame.height - frame.pad * 2;
  const xOf = (index: number): number => round(frame.pad + (index / span) * innerWidth);
  const yOf = (value: number): number =>
    round(frame.pad + (1 - Math.max(0, value) / peak) * innerHeight);
  const points = values.map((value, index) => ({ x: xOf(index), y: yOf(value) }));
  const now = points.at(-1) ?? { x: xOf(0), y: yOf(0) };
  const floor = yOf(0);
  const empty = forecastSteps === null ? null : { x: xOf(values.length - 1 + steps), y: yOf(0) };
  const first = points[0] ?? now;

  return {
    history: pathOf(points),
    area: `${pathOf(points)} L${now.x} ${floor} L${first.x} ${floor} Z`,
    forecast: empty === null ? null : pathOf([now, empty]),
    now,
    empty,
  };
};
