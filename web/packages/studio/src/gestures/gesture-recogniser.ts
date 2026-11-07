export type GesturePointerKind = 'touch' | 'pen' | 'mouse';

export type GesturePrecisionAxis = 'x' | 'y' | 'none';

export type GesturePrecisionTier = 'full' | 'half' | 'quarter' | 'fine';

export interface GesturePoint {
  x: number;
  y: number;
}

export interface GesturePolicy {
  drag: boolean;
  navigate: boolean;
  longPress: boolean;
  precision: GesturePrecisionAxis;
}

export type GestureInput =
  | { type: 'down'; id: number; x: number; y: number; t: number; kind: GesturePointerKind }
  | { type: 'move'; id: number; x: number; y: number; t: number }
  | { type: 'up'; id: number; x: number; y: number; t: number }
  | { type: 'cancel'; id: number }
  | { type: 'tick'; t: number }
  | { type: 'wheel'; dx: number; dy: number; x: number; y: number; zoom: boolean }
  | { type: 'scale'; ratio: number; x: number; y: number };

export interface GestureDragMove {
  point: GesturePoint;
  value: GesturePoint;
  delta: GesturePoint;
  precision: GesturePrecisionTier;
  held: boolean;
}

export type GestureIntent =
  | { kind: 'press'; point: GesturePoint; pointer: GesturePointerKind }
  | { kind: 'tap'; point: GesturePoint; pointer: GesturePointerKind }
  | { kind: 'pressCancel' }
  | { kind: 'longPress'; point: GesturePoint; pointer: GesturePointerKind }
  | { kind: 'holdEnd'; point: GesturePoint }
  | { kind: 'dragStart'; origin: GesturePoint; point: GesturePoint; held: boolean }
  | ({ kind: 'drag' } & GestureDragMove)
  | { kind: 'dragEnd'; value: GesturePoint; velocity: GesturePoint }
  | { kind: 'dragCancel' }
  | { kind: 'navigateStart'; focal: GesturePoint }
  | { kind: 'navigate'; focal: GesturePoint; scale: number; dx: number; dy: number }
  | { kind: 'navigateEnd'; velocity: GesturePoint };

interface GesturePointer extends GesturePoint {
  id: number;
}

interface GestureSample extends GesturePoint {
  t: number;
}

type GesturePhase =
  | { phase: 'idle' }
  | { phase: 'spent' }
  | {
      phase: 'pending';
      origin: GesturePoint;
      pointer: GesturePointerKind;
      deadline: number | null;
    }
  | { phase: 'held'; origin: GesturePoint; pointer: GesturePointerKind }
  | {
      phase: 'drag';
      origin: GesturePoint;
      last: GesturePoint;
      value: GesturePoint;
      held: boolean;
    }
  | { phase: 'navigate'; spread: number; mid: GesturePoint };

export interface GestureState {
  pointers: readonly GesturePointer[];
  gesture: GesturePhase;
  samples: readonly GestureSample[];
}

export interface GestureStep {
  state: GestureState;
  intents: GestureIntent[];
}

export const GESTURE_TOUCH_SLOP = 8;
export const GESTURE_MOUSE_SLOP = 3;
export const GESTURE_LONG_PRESS_MS = 450;
export const GESTURE_VELOCITY_WINDOW_MS = 80;
export const GESTURE_PRECISION_STEP = 50;

const WHEEL_ZOOM_RATE = 0.01;
const WHEEL_REACH = 50;

const PRECISION_TIERS: readonly { tier: GesturePrecisionTier; factor: number }[] = [
  { tier: 'full', factor: 1 },
  { tier: 'half', factor: 0.5 },
  { tier: 'quarter', factor: 0.25 },
  { tier: 'fine', factor: 0.1 },
];

const FINEST_TIER = PRECISION_TIERS[PRECISION_TIERS.length - 1] ?? { tier: 'fine', factor: 0.1 };

export const initialGesture = (): GestureState => ({
  pointers: [],
  gesture: { phase: 'idle' },
  samples: [],
});

const unchanged = (state: GestureState): GestureStep => ({ state, intents: [] });

const pointOf = (input: GesturePoint): GesturePoint => ({ x: input.x, y: input.y });

const distanceOf = (from: GesturePoint, to: GesturePoint): number =>
  Math.hypot(to.x - from.x, to.y - from.y);

const midpointOf = (first: GesturePoint, second: GesturePoint): GesturePoint => ({
  x: (first.x + second.x) / 2,
  y: (first.y + second.y) / 2,
});

const slopOf = (pointer: GesturePointerKind): number =>
  pointer === 'mouse' ? GESTURE_MOUSE_SLOP : GESTURE_TOUCH_SLOP;

const withSample = (
  samples: readonly GestureSample[],
  sample: GestureSample,
): readonly GestureSample[] => [
  ...samples.filter((kept) => sample.t - kept.t <= GESTURE_VELOCITY_WINDOW_MS),
  sample,
];

export const velocityOf = (samples: readonly GestureSample[]): GesturePoint => {
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (first === undefined || last === undefined || last.t <= first.t) {
    return { x: 0, y: 0 };
  }
  const elapsed = last.t - first.t;

  return { x: (last.x - first.x) / elapsed, y: (last.y - first.y) / elapsed };
};

export const precisionOf = (
  offAxisDistance: number,
): { tier: GesturePrecisionTier; factor: number } =>
  PRECISION_TIERS[Math.floor(Math.abs(offAxisDistance) / GESTURE_PRECISION_STEP)] ?? FINEST_TIER;

const offAxisDistanceOf = (
  axis: GesturePrecisionAxis,
  origin: GesturePoint,
  point: GesturePoint,
): number => {
  switch (axis) {
    case 'x':
      return point.y - origin.y;
    case 'y':
      return point.x - origin.x;
    case 'none':
      return 0;
  }
};

const preciseValueOf = (
  axis: GesturePrecisionAxis,
  value: GesturePoint,
  last: GesturePoint,
  point: GesturePoint,
  factor: number,
): GesturePoint => {
  switch (axis) {
    case 'x':
      return { x: value.x + (point.x - last.x) * factor, y: point.y };
    case 'y':
      return { x: point.x, y: value.y + (point.y - last.y) * factor };
    case 'none':
      return point;
  }
};

const navigateOf = (pointers: readonly GesturePointer[]): GesturePhase => {
  const [first, second] = pointers;
  if (first === undefined || second === undefined) {
    return { phase: 'spent' };
  }

  return { phase: 'navigate', spread: distanceOf(first, second), mid: midpointOf(first, second) };
};

const leavingIntents = (gesture: GesturePhase): GestureIntent[] => {
  switch (gesture.phase) {
    case 'pending':
      return [{ kind: 'pressCancel' }];
    case 'drag':
      return [{ kind: 'dragCancel' }];
    case 'held':
      return [{ kind: 'holdEnd', point: gesture.origin }];
    default:
      return [];
  }
};

const cancelIntents = (gesture: GesturePhase): GestureIntent[] => {
  switch (gesture.phase) {
    case 'navigate':
      return [{ kind: 'navigateEnd', velocity: { x: 0, y: 0 } }];
    default:
      return leavingIntents(gesture);
  }
};

const secondPointerDown = (
  state: GestureState,
  pointer: GesturePointer,
  policy: GesturePolicy,
): GestureStep => {
  if (!policy.navigate) {
    return unchanged(state);
  }
  const pointers = [...state.pointers, pointer];
  const gesture = navigateOf(pointers);
  const intents: GestureIntent[] =
    gesture.phase === 'navigate'
      ? [...leavingIntents(state.gesture), { kind: 'navigateStart', focal: gesture.mid }]
      : [];

  return { state: { ...state, pointers, gesture, samples: [] }, intents };
};

const pointerDown = (
  state: GestureState,
  input: Extract<GestureInput, { type: 'down' }>,
  policy: GesturePolicy,
): GestureStep => {
  const pointer: GesturePointer = { id: input.id, x: input.x, y: input.y };
  if (state.pointers.some((held) => held.id === input.id)) {
    const restarted = pointerDown(initialGesture(), input, policy);

    return {
      state: restarted.state,
      intents: [...cancelIntents(state.gesture), ...restarted.intents],
    };
  }
  if (state.pointers.length >= 2) {
    return unchanged(state);
  }
  if (state.pointers.length === 1) {
    return secondPointerDown(state, pointer, policy);
  }
  const origin = pointOf(input);

  return {
    state: {
      pointers: [pointer],
      gesture: {
        phase: 'pending',
        origin,
        pointer: input.kind,
        deadline: policy.longPress ? input.t + GESTURE_LONG_PRESS_MS : null,
      },
      samples: [{ ...origin, t: input.t }],
    },
    intents: [{ kind: 'press', point: origin, pointer: input.kind }],
  };
};

const fireLongPress = (state: GestureState, t: number): GestureStep => {
  const gesture = state.gesture;
  if (gesture.phase !== 'pending' || gesture.deadline === null || t < gesture.deadline) {
    return unchanged(state);
  }

  return {
    state: {
      ...state,
      gesture: { phase: 'held', origin: gesture.origin, pointer: gesture.pointer },
    },
    intents: [{ kind: 'longPress', point: gesture.origin, pointer: gesture.pointer }],
  };
};

const startDrag = (
  state: GestureState,
  origin: GesturePoint,
  point: GesturePoint,
  held: boolean,
  policy: GesturePolicy,
): GestureStep => {
  if (!policy.drag) {
    return {
      state: { ...state, gesture: { phase: 'spent' } },
      intents: leavingIntents(state.gesture),
    };
  }
  const precision = precisionOf(offAxisDistanceOf(policy.precision, origin, point));

  return {
    state: { ...state, gesture: { phase: 'drag', origin, last: point, value: point, held } },
    intents: [
      { kind: 'dragStart', origin, point, held },
      {
        kind: 'drag',
        point,
        value: point,
        delta: { x: point.x - origin.x, y: point.y - origin.y },
        precision: precision.tier,
        held,
      },
    ],
  };
};

const followDrag = (
  state: GestureState,
  point: GesturePoint,
  policy: GesturePolicy,
): GestureStep => {
  const gesture = state.gesture;
  if (gesture.phase !== 'drag') {
    return unchanged(state);
  }
  const precision = precisionOf(offAxisDistanceOf(policy.precision, gesture.origin, point));
  const value = preciseValueOf(
    policy.precision,
    gesture.value,
    gesture.last,
    point,
    precision.factor,
  );

  return {
    state: { ...state, gesture: { ...gesture, last: point, value } },
    intents: [
      {
        kind: 'drag',
        point,
        value,
        delta: { x: value.x - gesture.value.x, y: value.y - gesture.value.y },
        precision: precision.tier,
        held: gesture.held,
      },
    ],
  };
};

const followNavigate = (state: GestureState): GestureStep => {
  const gesture = state.gesture;
  const [first, second] = state.pointers;
  if (gesture.phase !== 'navigate' || first === undefined || second === undefined) {
    return unchanged(state);
  }
  const spread = distanceOf(first, second);
  const mid = midpointOf(first, second);
  const scale = gesture.spread > 0 && spread > 0 ? spread / gesture.spread : 1;

  return {
    state: { ...state, gesture: { phase: 'navigate', spread, mid } },
    intents: [
      { kind: 'navigate', focal: mid, scale, dx: mid.x - gesture.mid.x, dy: mid.y - gesture.mid.y },
    ],
  };
};

const followHeld = (
  state: GestureState,
  origin: GesturePoint,
  pointer: GesturePointerKind,
  point: GesturePoint,
  policy: GesturePolicy,
): GestureStep =>
  distanceOf(origin, point) < slopOf(pointer)
    ? unchanged(state)
    : startDrag(state, origin, point, true, policy);

const midpointOfAll = (pointers: readonly GesturePointer[]): GesturePoint => {
  const [first, second] = pointers;
  if (first === undefined) {
    return { x: 0, y: 0 };
  }

  return second === undefined ? pointOf(first) : midpointOf(first, second);
};

const pointerMove = (
  state: GestureState,
  input: Extract<GestureInput, { type: 'move' }>,
  policy: GesturePolicy,
): GestureStep => {
  if (!state.pointers.some((pointer) => pointer.id === input.id)) {
    return unchanged(state);
  }
  const point = pointOf(input);
  const pointers = state.pointers.map((pointer) =>
    pointer.id === input.id ? { id: input.id, ...point } : pointer,
  );
  const gesture = state.gesture;
  const tracked = gesture.phase === 'navigate' ? midpointOfAll(pointers) : point;
  const moved: GestureState = {
    ...state,
    pointers,
    samples: withSample(state.samples, { ...tracked, t: input.t }),
  };
  switch (gesture.phase) {
    case 'navigate':
      return followNavigate(moved);
    case 'drag':
      return followDrag(moved, point, policy);
    case 'pending': {
      const expired = fireLongPress(moved, input.t);
      if (expired.intents.length > 0) {
        const holding = followHeld(expired.state, gesture.origin, gesture.pointer, point, policy);

        return { state: holding.state, intents: [...expired.intents, ...holding.intents] };
      }
      if (distanceOf(gesture.origin, point) < slopOf(gesture.pointer)) {
        return unchanged(moved);
      }

      return startDrag(moved, gesture.origin, point, false, policy);
    }
    case 'held':
      return followHeld(moved, gesture.origin, gesture.pointer, point, policy);
    default:
      return unchanged(moved);
  }
};

const resting = (): GestureState => initialGesture();

const releaseAll = (
  state: GestureState,
  point: GesturePoint,
  samples: readonly GestureSample[],
): GestureIntent[] => {
  const gesture = state.gesture;
  switch (gesture.phase) {
    case 'pending':
      return [{ kind: 'tap', point: gesture.origin, pointer: gesture.pointer }];
    case 'held':
      return [{ kind: 'holdEnd', point }];
    case 'drag':
      return [{ kind: 'dragEnd', value: gesture.value, velocity: velocityOf(samples) }];
    default:
      return [];
  }
};

const pointerUp = (
  state: GestureState,
  input: Extract<GestureInput, { type: 'up' }>,
): GestureStep => {
  if (!state.pointers.some((pointer) => pointer.id === input.id)) {
    return unchanged(state);
  }
  const remaining = state.pointers.filter((pointer) => pointer.id !== input.id);
  if (state.gesture.phase === 'navigate') {
    const settled = withSample(state.samples, { ...midpointOfAll(state.pointers), t: input.t });

    return {
      state: { pointers: remaining, gesture: { phase: 'spent' }, samples: [] },
      intents: [{ kind: 'navigateEnd', velocity: velocityOf(settled) }],
    };
  }
  const samples = withSample(state.samples, { ...pointOf(input), t: input.t });

  return { state: resting(), intents: releaseAll(state, pointOf(input), samples) };
};

const pointerCancel = (state: GestureState, id: number): GestureStep => {
  if (!state.pointers.some((pointer) => pointer.id === id)) {
    return unchanged(state);
  }
  const remaining = state.pointers.filter((pointer) => pointer.id !== id);
  const intents = cancelIntents(state.gesture);

  return {
    state:
      remaining.length === 0
        ? resting()
        : { pointers: remaining, gesture: { phase: 'spent' }, samples: [] },
    intents,
  };
};

export type GestureWheelUnit = 'pixel' | 'line' | 'page';

export const GESTURE_PIXELS_PER_LINE = 16;

export const wheelPixelsOf = (delta: number, unit: GestureWheelUnit, pageSize: number): number => {
  switch (unit) {
    case 'pixel':
      return delta;
    case 'line':
      return delta * GESTURE_PIXELS_PER_LINE;
    case 'page':
      return delta * pageSize;
  }
};

const wheelReach = (delta: number): number => Math.min(Math.max(delta, -WHEEL_REACH), WHEEL_REACH);

const wheel = (
  state: GestureState,
  input: Extract<GestureInput, { type: 'wheel' }>,
  policy: GesturePolicy,
): GestureStep => {
  if (!policy.navigate || state.pointers.length > 0) {
    return unchanged(state);
  }
  const focal = pointOf(input);
  const intent: GestureIntent = input.zoom
    ? {
        kind: 'navigate',
        focal,
        scale: Math.exp(-wheelReach(input.dy) * WHEEL_ZOOM_RATE),
        dx: 0,
        dy: 0,
      }
    : { kind: 'navigate', focal, scale: 1, dx: -input.dx, dy: -input.dy };

  return { state, intents: [intent] };
};

const scale = (
  state: GestureState,
  input: Extract<GestureInput, { type: 'scale' }>,
  policy: GesturePolicy,
): GestureStep =>
  !policy.navigate || state.pointers.length > 0 || input.ratio <= 0
    ? unchanged(state)
    : {
        state,
        intents: [{ kind: 'navigate', focal: pointOf(input), scale: input.ratio, dx: 0, dy: 0 }],
      };

export const stepGesture = (
  state: GestureState,
  input: GestureInput,
  policy: GesturePolicy,
): GestureStep => {
  switch (input.type) {
    case 'down':
      return pointerDown(state, input, policy);
    case 'move':
      return pointerMove(state, input, policy);
    case 'up':
      return pointerUp(state, input);
    case 'cancel':
      return pointerCancel(state, input.id);
    case 'tick':
      return fireLongPress(state, input.t);
    case 'wheel':
      return wheel(state, input, policy);
    case 'scale':
      return scale(state, input, policy);
  }
};

export const longPressDeadlineOf = (state: GestureState): number | null =>
  state.gesture.phase === 'pending' ? state.gesture.deadline : null;

export const isGestureActive = (state: GestureState): boolean => state.pointers.length > 0;
