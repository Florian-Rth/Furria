import { z } from 'zod';

const DEFAULT_HOLD_MS = 700;
const DEFAULT_SPREAD_PX = 80;
const TAP_MS = 60;

const PointSchema = z.tuple([z.number(), z.number()]);

export const TouchGestureSchema = z.discriminatedUnion('gesture', [
  z.object({ gesture: z.literal('tap'), at: PointSchema }),
  z.object({
    gesture: z.literal('longPress'),
    at: PointSchema,
    holdMs: z.number().positive().default(DEFAULT_HOLD_MS),
  }),
  z.object({
    gesture: z.literal('drag'),
    path: z.array(PointSchema).min(2),
    ms: z.number().positive(),
    holdMs: z.number().nonnegative().default(0),
  }),
  z.object({
    gesture: z.literal('pinch'),
    centre: PointSchema,
    fromSpread: z.number().positive(),
    toSpread: z.number().positive(),
    ms: z.number().positive(),
  }),
  z.object({
    gesture: z.literal('pan'),
    from: PointSchema,
    to: PointSchema,
    spread: z.number().positive().default(DEFAULT_SPREAD_PX),
    ms: z.number().positive(),
  }),
  z.object({ gesture: z.literal('wait'), ms: z.number().nonnegative() }),
]);

export const TouchScriptSchema = z.array(TouchGestureSchema).min(1);

export type TouchGesture = z.infer<typeof TouchGestureSchema>;
export type TouchScript = z.infer<typeof TouchScriptSchema>;

export interface TouchPoint {
  readonly id: number;
  readonly x: number;
  readonly y: number;
}

export interface TouchFrame {
  readonly at: number;
  readonly type: 'touchStart' | 'touchMove' | 'touchEnd';
  readonly points: readonly TouchPoint[];
}

export const TOUCH_FRAME_MS = 16;

type Point = readonly [number, number];

const lengthOf = (from: Point, to: Point): number => Math.hypot(to[0] - from[0], to[1] - from[1]);

export const pointAlong = (path: readonly Point[], share: number): Point => {
  const legs = path.slice(1).map((to, index) => ({ from: path[index] ?? to, to }));
  const total = legs.reduce((sum, leg) => sum + lengthOf(leg.from, leg.to), 0);
  const first = path[0] ?? [0, 0];
  if (total === 0) {
    return first;
  }
  let remaining = Math.min(Math.max(share, 0), 1) * total;
  for (const leg of legs) {
    const length = lengthOf(leg.from, leg.to);
    if (remaining <= length && length > 0) {
      const ratio = remaining / length;

      return [
        leg.from[0] + (leg.to[0] - leg.from[0]) * ratio,
        leg.from[1] + (leg.to[1] - leg.from[1]) * ratio,
      ];
    }
    remaining -= length;
  }

  return path[path.length - 1] ?? first;
};

const stepsOf = (ms: number): number[] => {
  const count = Math.max(Math.ceil(ms / TOUCH_FRAME_MS), 1);

  return Array.from({ length: count }, (_, index) => (index + 1) / count);
};

const finger = (id: number, point: Point): TouchPoint => ({ id, x: point[0], y: point[1] });

const twoFingers = (centre: Point, spread: number): TouchPoint[] => [
  finger(1, [centre[0] - spread / 2, centre[1]]),
  finger(2, [centre[0] + spread / 2, centre[1]]),
];

const press = (at: Point, holdMs: number): TouchFrame[] => [
  { at: 0, type: 'touchStart', points: [finger(1, at)] },
  { at: holdMs, type: 'touchEnd', points: [] },
];

const dragFrames = (path: readonly Point[], ms: number, holdMs: number): TouchFrame[] => {
  const start = path[0] ?? [0, 0];
  const moves = stepsOf(ms).map(
    (share): TouchFrame => ({
      at: holdMs + share * ms,
      type: 'touchMove',
      points: [finger(1, pointAlong(path, share))],
    }),
  );

  return [
    { at: 0, type: 'touchStart', points: [finger(1, start)] },
    ...moves,
    { at: holdMs + ms + TOUCH_FRAME_MS, type: 'touchEnd', points: [] },
  ];
};

const twoFingerFrames = (
  ms: number,
  placeAt: (share: number) => readonly TouchPoint[],
): TouchFrame[] => [
  { at: 0, type: 'touchStart', points: placeAt(0) },
  ...stepsOf(ms).map(
    (share): TouchFrame => ({ at: share * ms, type: 'touchMove', points: placeAt(share) }),
  ),
  { at: ms + TOUCH_FRAME_MS, type: 'touchEnd', points: [] },
];

export const touchFramesOf = (gesture: TouchGesture): TouchFrame[] => {
  switch (gesture.gesture) {
    case 'tap':
      return press(gesture.at, TAP_MS);
    case 'longPress':
      return press(gesture.at, gesture.holdMs);
    case 'drag':
      return dragFrames(gesture.path, gesture.ms, gesture.holdMs);
    case 'pinch':
      return twoFingerFrames(gesture.ms, (share) =>
        twoFingers(
          gesture.centre,
          gesture.fromSpread + (gesture.toSpread - gesture.fromSpread) * share,
        ),
      );
    case 'pan':
      return twoFingerFrames(gesture.ms, (share) =>
        twoFingers(pointAlong([gesture.from, gesture.to], share), gesture.spread),
      );
    case 'wait':
      return [];
  }
};

export const durationOf = (gesture: TouchGesture): number => {
  const frames = touchFramesOf(gesture);

  return gesture.gesture === 'wait' ? gesture.ms : (frames[frames.length - 1]?.at ?? 0);
};
