import type { KkSize } from '../../image-aspect';
import type { KkCrop } from '../../image-crop';
import { cropInsidePicture } from '../../image-crop';
import type { StageFit, StageFrame, StagePoint, StageTransform } from './stage-geometry';
import {
  clampTransform,
  clampZoom,
  cropOf,
  edgesOf,
  fittedSizeOf,
  rubberClamp,
  STAGE_REST,
  transformOfCrop,
  zoomAbout,
} from './stage-geometry';

export interface StagePolicy {
  fit: StageFit;
  maxZoom: number;
  doubleTapZoom: number;
  swipe: boolean;
  pull: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  reducedMotion: boolean;
}

export interface StagePointerInput {
  type: 'pointerDown' | 'pointerMove' | 'pointerUp' | 'pointerCancel';
  id: number;
  x: number;
  y: number;
  t: number;
  shown?: StageTransform;
}

export type StageInput =
  | StagePointerInput
  | { type: 'wheel'; dx: number; dy: number; x: number; y: number; pinch: boolean; t: number }
  | { type: 'pinchGesture'; scale: number; x: number; y: number; t: number }
  | { type: 'zoomKey'; direction: 1 | -1 | 0 }
  | { type: 'panKey'; dx: number; dy: number }
  | { type: 'zoomTo'; zoom: number }
  | { type: 'measure'; stage?: KkSize; image?: KkSize | null }
  | { type: 'reset'; transform?: StageTransform; crop?: KkCrop };

export type StageIntent =
  | { kind: 'step'; delta: 1 | -1 }
  | { kind: 'pull' }
  | { kind: 'tap' }
  | { kind: 'zoomed'; zoomed: boolean }
  | { kind: 'transformed'; transform: StageTransform };

export type StageMotion = 'follow' | 'settle' | 'slide' | 'instant';

export type StagePhase = 'idle' | 'pending' | 'pan' | 'swipe' | 'pull' | 'pinch';

export interface StageView {
  image: StageTransform;
  track: number;
  pull: number;
  motion: StageMotion;
  phase: StagePhase;
}

interface StagePointer extends StagePoint {
  id: number;
}

interface StageSample extends StagePoint {
  t: number;
}

type StageGesture =
  | { phase: 'idle' }
  | { phase: 'ignored' }
  | { phase: 'pending'; origin: StageSample; start: StageTransform }
  | { phase: 'pan'; origin: StagePoint; start: StageTransform }
  | { phase: 'swipe'; origin: StagePoint }
  | { phase: 'pull'; origin: StagePoint }
  | { phase: 'pinch'; spread: number; mid: StagePoint; start: StageTransform };

export interface StageState {
  stage: KkSize | null;
  image: KkSize | null;
  anchor: KkCrop | null;
  transform: StageTransform;
  track: number;
  pull: number;
  motion: StageMotion;
  pointers: readonly StagePointer[];
  gesture: StageGesture;
  samples: readonly StageSample[];
  lastTap: StageSample | null;
}

export interface StageStep {
  state: StageState;
  intents: StageIntent[];
}

export const STAGE_SLOP = 8;
export const STAGE_SWIPE_COMMIT = 0.2;
export const STAGE_FLICK_SPEED = 0.45;
export const STAGE_FLICK_WINDOW = 80;
export const STAGE_PULL_COMMIT = 120;
export const STAGE_TIGHT_ELASTIC = 0.16;
export const STAGE_DOUBLE_TAP_WINDOW = 300;
export const STAGE_DOUBLE_TAP_REACH = 24;
export const STAGE_KEY_ZOOM = 1.25;
export const STAGE_KEY_PAN = 0.05;
const PINCH_WHEEL_RATE = 0.01;
const WHEEL_ZOOM_RATE = 0.0025;
const WHEEL_REACH = 50;
const ZOOMED_EPSILON = 1e-3;

export const initialStage = (anchor: KkCrop | null = null): StageState => ({
  stage: null,
  image: null,
  anchor,
  transform: STAGE_REST,
  track: 0,
  pull: 0,
  motion: 'instant',
  pointers: [],
  gesture: { phase: 'idle' },
  samples: [],
  lastTap: null,
});

export const isZoomed = (transform: StageTransform): boolean => transform.zoom > 1 + ZOOMED_EPSILON;

const frameOf = (state: StageState, policy: StagePolicy): StageFrame | null =>
  state.stage === null || state.image === null
    ? null
    : { stage: state.stage, image: state.image, fit: policy.fit };

const focalOf = (point: StagePoint, stage: KkSize): StagePoint => ({
  x: point.x - stage.width / 2,
  y: point.y - stage.height / 2,
});

const distanceOf = (from: StagePoint, to: StagePoint): number =>
  Math.hypot(to.x - from.x, to.y - from.y);

const midpointOf = (first: StagePoint, second: StagePoint): StagePoint => ({
  x: (first.x + second.x) / 2,
  y: (first.y + second.y) / 2,
});

const settledMotion = (motion: StageMotion, policy: StagePolicy): StageMotion =>
  policy.reducedMotion && (motion === 'settle' || motion === 'slide') ? 'instant' : motion;

const unchanged = (state: StageState): StageStep => ({ state, intents: [] });

const transformed = (transform: StageTransform): StageIntent => ({
  kind: 'transformed',
  transform,
});

const commitTransform = (
  state: StageState,
  frame: StageFrame,
  policy: StagePolicy,
  target: StageTransform,
  motion: StageMotion,
): StageStep => {
  const transform = clampTransform(target, frame, policy.maxZoom);

  return {
    state: { ...state, transform, motion: settledMotion(motion, policy) },
    intents: [transformed(transform)],
  };
};

const withSample = (samples: readonly StageSample[], sample: StageSample): StageSample[] => [
  ...samples.filter((kept) => sample.t - kept.t <= STAGE_FLICK_WINDOW),
  sample,
];

const velocityOf = (samples: readonly StageSample[]): StagePoint => {
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (first === undefined || last === undefined || last.t <= first.t) {
    return { x: 0, y: 0 };
  }
  const elapsed = last.t - first.t;

  return { x: (last.x - first.x) / elapsed, y: (last.y - first.y) / elapsed };
};

const hasNeighbourToward = (offset: number, policy: StagePolicy): boolean =>
  policy.swipe && (offset > 0 ? policy.hasPrevious : offset < 0 && policy.hasNext);

const pinchOf = (state: StageState, pointers: readonly StagePointer[]): StageGesture => {
  const [first, second] = pointers;
  if (first === undefined || second === undefined) {
    return state.gesture;
  }

  return {
    phase: 'pinch',
    spread: distanceOf(first, second),
    mid: midpointOf(first, second),
    start: state.transform,
  };
};

const pointerDown = (state: StageState, input: StagePointerInput): StageStep => {
  const pointer: StagePointer = { id: input.id, x: input.x, y: input.y };
  if (state.pointers.length >= 2) {
    return unchanged(state);
  }
  if (state.pointers.length === 1) {
    const pointers = [...state.pointers, pointer];

    return unchanged({
      ...state,
      pointers,
      gesture: pinchOf(state, pointers),
      track: 0,
      pull: 0,
      motion: 'follow',
    });
  }
  const start = input.shown ?? state.transform;
  const origin: StageSample = { x: input.x, y: input.y, t: input.t };

  return unchanged({
    ...state,
    transform: start,
    pointers: [pointer],
    gesture: { phase: 'pending', origin, start },
    samples: [origin],
    motion: 'follow',
  });
};

const classify = (
  origin: StagePoint,
  start: StageTransform,
  point: StagePoint,
  policy: StagePolicy,
): StageGesture => {
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  const pannable = isZoomed(start) || (!policy.swipe && !policy.pull);
  if (pannable) {
    return { phase: 'pan', origin, start };
  }
  if (Math.abs(dx) >= Math.abs(dy)) {
    return policy.swipe ? { phase: 'swipe', origin } : { phase: 'ignored' };
  }

  return dy > 0 && policy.pull ? { phase: 'pull', origin } : { phase: 'ignored' };
};

const panTo = (
  state: StageState,
  frame: StageFrame,
  policy: StagePolicy,
  raw: StageTransform,
): StageState => {
  const edges = edgesOf(raw, frame);
  const overflow =
    raw.x > edges.maxX ? raw.x - edges.maxX : raw.x < edges.minX ? raw.x - edges.minX : 0;
  if (overflow !== 0 && hasNeighbourToward(overflow, policy)) {
    const pinned = rubberClamp({ ...raw, x: overflow > 0 ? edges.maxX : edges.minX }, frame);

    return { ...state, transform: pinned, track: overflow };
  }

  return { ...state, transform: rubberClamp(raw, frame), track: 0 };
};

const swipeTrackOf = (dx: number, policy: StagePolicy): number =>
  hasNeighbourToward(dx, policy) ? dx : dx * STAGE_TIGHT_ELASTIC;

const follow = (
  state: StageState,
  point: StagePoint,
  frame: StageFrame | null,
  policy: StagePolicy,
): StageState => {
  const gesture = state.gesture;
  switch (gesture.phase) {
    case 'pan':
      return frame === null
        ? state
        : panTo(state, frame, policy, {
            x: gesture.start.x + point.x - gesture.origin.x,
            y: gesture.start.y + point.y - gesture.origin.y,
            zoom: gesture.start.zoom,
          });
    case 'swipe':
      return { ...state, track: swipeTrackOf(point.x - gesture.origin.x, policy) };
    case 'pull':
      return { ...state, pull: Math.max(point.y - gesture.origin.y, 0) };
    default:
      return state;
  }
};

const pinchTo = (
  state: StageState,
  frame: StageFrame | null,
  policy: StagePolicy,
  pointers: readonly StagePointer[],
): StageState => {
  const gesture = state.gesture;
  const [first, second] = pointers;
  if (
    gesture.phase !== 'pinch' ||
    frame === null ||
    first === undefined ||
    second === undefined ||
    gesture.spread <= 0
  ) {
    return state;
  }
  const mid = midpointOf(first, second);
  const zoom = clampZoom(
    (gesture.start.zoom * distanceOf(first, second)) / gesture.spread,
    policy.maxZoom,
  );
  const zoomed = zoomAbout(gesture.start, zoom, focalOf(gesture.mid, frame.stage));
  const raw = {
    x: zoomed.x + mid.x - gesture.mid.x,
    y: zoomed.y + mid.y - gesture.mid.y,
    zoom,
  };

  return { ...state, transform: rubberClamp(raw, frame) };
};

const pointerMove = (
  state: StageState,
  input: StagePointerInput,
  policy: StagePolicy,
): StageStep => {
  if (!state.pointers.some((pointer) => pointer.id === input.id)) {
    return unchanged(state);
  }
  const pointers = state.pointers.map((pointer) =>
    pointer.id === input.id ? { id: input.id, x: input.x, y: input.y } : pointer,
  );
  const frame = frameOf(state, policy);
  const moved: StageState = {
    ...state,
    pointers,
    samples: withSample(state.samples, { x: input.x, y: input.y, t: input.t }),
    motion: 'follow',
  };
  const gesture = state.gesture;
  if (gesture.phase === 'pinch') {
    return unchanged(pinchTo(moved, frame, policy, pointers));
  }
  if (gesture.phase === 'pending') {
    if (distanceOf(gesture.origin, input) < STAGE_SLOP) {
      return unchanged(moved);
    }
    const classified = {
      ...moved,
      gesture: classify(gesture.origin, gesture.start, input, policy),
    };

    return unchanged(follow(classified, input, frame, policy));
  }

  return unchanged(follow(moved, input, frame, policy));
};

const restingAfter = (state: StageState): StageState => ({
  ...state,
  pointers: [],
  gesture: { phase: 'idle' },
  samples: [],
});

const isFlick = (speed: number, offset: number): boolean =>
  Math.abs(speed) >= STAGE_FLICK_SPEED && Math.sign(speed) === Math.sign(offset);

const releaseTrack = (
  state: StageState,
  policy: StagePolicy,
): { track: number; intents: StageIntent[]; motion: StageMotion } => {
  const width = state.stage?.width ?? 0;
  const velocity = velocityOf(state.samples);
  const travelled = Math.abs(state.track) >= width * STAGE_SWIPE_COMMIT;
  const commits =
    state.track !== 0 &&
    hasNeighbourToward(state.track, policy) &&
    (travelled || isFlick(velocity.x, state.track));
  if (!commits) {
    return { track: 0, intents: [], motion: 'settle' };
  }
  const delta = state.track < 0 ? 1 : -1;

  return { track: -delta * width, intents: [{ kind: 'step', delta }], motion: 'slide' };
};

const doubleTapZoomOf = (
  transform: StageTransform,
  point: StagePoint,
  stage: KkSize,
  policy: StagePolicy,
): StageTransform =>
  zoomAbout(transform, isZoomed(transform) ? 1 : policy.doubleTapZoom, focalOf(point, stage));

const releaseTap = (state: StageState, tap: StageSample, policy: StagePolicy): StageStep => {
  const rested = restingAfter(state);
  const previous = state.lastTap;
  const isDouble =
    previous !== null &&
    tap.t - previous.t <= STAGE_DOUBLE_TAP_WINDOW &&
    distanceOf(previous, tap) <= STAGE_DOUBLE_TAP_REACH;
  const frame = frameOf(state, policy);
  if (!isDouble || frame === null || policy.doubleTapZoom <= 1) {
    return { state: { ...rested, lastTap: tap }, intents: [{ kind: 'tap' }] };
  }
  const target = doubleTapZoomOf(state.transform, tap, frame.stage, policy);

  return commitTransform({ ...rested, lastTap: null }, frame, policy, target, 'settle');
};

const pointerUp = (state: StageState, input: StagePointerInput, policy: StagePolicy): StageStep => {
  if (!state.pointers.some((pointer) => pointer.id === input.id)) {
    return unchanged(state);
  }
  const remaining = state.pointers.filter((pointer) => pointer.id !== input.id);
  const lifted = remaining[0];
  if (state.gesture.phase === 'pinch' && lifted !== undefined) {
    return unchanged({
      ...state,
      pointers: remaining,
      gesture: { phase: 'pan', origin: lifted, start: state.transform },
      samples: [],
    });
  }
  const sampled: StageState = {
    ...state,
    samples: withSample(state.samples, { x: input.x, y: input.y, t: input.t }),
  };
  const gesture = state.gesture;
  if (gesture.phase === 'pending') {
    return releaseTap(state, { x: input.x, y: input.y, t: input.t }, policy);
  }
  if (gesture.phase === 'pull') {
    const commits =
      state.pull >= STAGE_PULL_COMMIT || isFlick(velocityOf(sampled.samples).y, state.pull);
    const intents: StageIntent[] = commits ? [{ kind: 'pull' }] : [];

    return {
      state: { ...restingAfter(state), pull: 0, motion: settledMotion('settle', policy) },
      intents,
    };
  }
  const release = releaseTrack(sampled, policy);
  const frame = frameOf(state, policy);
  const rested: StageState = {
    ...restingAfter(state),
    track: release.track,
    pull: 0,
    motion: settledMotion(release.motion, policy),
  };
  if (frame === null || (gesture.phase !== 'pan' && gesture.phase !== 'pinch')) {
    return { state: rested, intents: release.intents };
  }
  const transform = clampTransform(state.transform, frame, policy.maxZoom);

  return {
    state: { ...rested, transform },
    intents: [...release.intents, transformed(transform)],
  };
};

const pointerCancel = (state: StageState, policy: StagePolicy): StageStep => {
  const frame = frameOf(state, policy);
  const transform =
    frame === null ? state.transform : clampTransform(state.transform, frame, policy.maxZoom);

  return unchanged({
    ...restingAfter(state),
    transform,
    track: 0,
    pull: 0,
    motion: settledMotion('settle', policy),
  });
};

const zoomBy = (
  state: StageState,
  policy: StagePolicy,
  factor: number,
  point: StagePoint | null,
  motion: StageMotion,
): StageStep => {
  const frame = frameOf(state, policy);
  if (frame === null) {
    return unchanged(state);
  }
  const focal = point === null ? { x: 0, y: 0 } : focalOf(point, frame.stage);
  const zoom = clampZoom(state.transform.zoom * factor, policy.maxZoom);

  return commitTransform(state, frame, policy, zoomAbout(state.transform, zoom, focal), motion);
};

const wheelReach = (delta: number): number => Math.min(Math.max(delta, -WHEEL_REACH), WHEEL_REACH);

const wheel = (
  state: StageState,
  input: Extract<StageInput, { type: 'wheel' }>,
  policy: StagePolicy,
): StageStep => {
  if (input.pinch || !policy.swipe) {
    const rate = input.pinch ? PINCH_WHEEL_RATE : WHEEL_ZOOM_RATE;

    return zoomBy(state, policy, Math.exp(-wheelReach(input.dy) * rate), input, 'follow');
  }
  const frame = frameOf(state, policy);
  if (frame === null || !isZoomed(state.transform)) {
    return unchanged(state);
  }
  const target = {
    ...state.transform,
    x: state.transform.x - input.dx,
    y: state.transform.y - input.dy,
  };

  return commitTransform(state, frame, policy, target, 'follow');
};

const zoomKey = (state: StageState, direction: 1 | -1 | 0, policy: StagePolicy): StageStep => {
  if (direction !== 0) {
    return zoomBy(state, policy, STAGE_KEY_ZOOM ** direction, null, 'settle');
  }
  const frame = frameOf(state, policy);

  return frame === null
    ? unchanged(state)
    : commitTransform(state, frame, policy, STAGE_REST, 'settle');
};

const panKey = (state: StageState, dx: number, dy: number, policy: StagePolicy): StageStep => {
  const frame = frameOf(state, policy);
  if (frame === null) {
    return unchanged(state);
  }
  const target = {
    ...state.transform,
    x: state.transform.x - dx * frame.stage.width * STAGE_KEY_PAN,
    y: state.transform.y - dy * frame.stage.height * STAGE_KEY_PAN,
  };

  return commitTransform(state, frame, policy, target, 'settle');
};

const zoomTo = (state: StageState, zoom: number, policy: StagePolicy): StageStep => {
  const frame = frameOf(state, policy);

  return frame === null
    ? unchanged(state)
    : commitTransform(
        state,
        frame,
        policy,
        zoomAbout(state.transform, zoom, { x: 0, y: 0 }),
        'follow',
      );
};

const isNewImage = (state: StageState, image: KkSize | null | undefined): boolean =>
  image !== undefined &&
  state.image !== null &&
  (image === null || image.width !== state.image.width || image.height !== state.image.height);

const placementAfterMeasure = (
  state: StageState,
  measured: StageState,
  frame: StageFrame,
  fresh: boolean,
  policy: StagePolicy,
): StageTransform => {
  if (measured.anchor !== null) {
    return transformOfCrop(measured.anchor, frame);
  }
  const before = frameOf(state, policy);

  return fresh || before === null
    ? measured.transform
    : transformOfCrop(cropOf(state.transform, before), frame);
};

const measure = (
  state: StageState,
  input: Extract<StageInput, { type: 'measure' }>,
  policy: StagePolicy,
): StageStep => {
  const fresh = isNewImage(state, input.image);
  const measured: StageState = {
    ...state,
    stage: input.stage ?? state.stage,
    image: input.image === undefined ? state.image : input.image,
    transform: fresh ? STAGE_REST : state.transform,
  };
  const frame = frameOf(measured, policy);
  if (frame === null) {
    return unchanged(measured);
  }
  const placement = placementAfterMeasure(state, measured, frame, fresh, policy);

  return commitTransform({ ...measured, anchor: null }, frame, policy, placement, 'instant');
};

const reset = (
  state: StageState,
  input: Extract<StageInput, { type: 'reset' }>,
  policy: StagePolicy,
): StageStep => {
  const rested: StageState = {
    ...restingAfter(state),
    track: 0,
    pull: 0,
    lastTap: null,
    motion: 'instant',
    anchor: input.crop ?? null,
    transform: input.transform ?? STAGE_REST,
  };
  const frame = frameOf(rested, policy);
  if (frame === null) {
    return unchanged(rested);
  }
  const placement =
    input.crop === undefined ? rested.transform : transformOfCrop(input.crop, frame);

  return commitTransform({ ...rested, anchor: null }, frame, policy, placement, 'instant');
};

const dispatch = (state: StageState, input: StageInput, policy: StagePolicy): StageStep => {
  switch (input.type) {
    case 'pointerDown':
      return pointerDown(state, input);
    case 'pointerMove':
      return pointerMove(state, input, policy);
    case 'pointerUp':
      return pointerUp(state, input, policy);
    case 'pointerCancel':
      return pointerCancel(state, policy);
    case 'wheel':
      return wheel(state, input, policy);
    case 'pinchGesture':
      return state.pointers.length > 0
        ? unchanged(state)
        : zoomBy(state, policy, input.scale, input, 'follow');
    case 'zoomKey':
      return zoomKey(state, input.direction, policy);
    case 'panKey':
      return panKey(state, input.dx, input.dy, policy);
    case 'zoomTo':
      return zoomTo(state, input.zoom, policy);
    case 'measure':
      return measure(state, input, policy);
    case 'reset':
      return reset(state, input, policy);
  }
};

export const stepStage = (state: StageState, input: StageInput, policy: StagePolicy): StageStep => {
  const step = dispatch(state, input, policy);
  const wasZoomed = isZoomed(state.transform);
  const nowZoomed = isZoomed(step.state.transform);
  if (wasZoomed === nowZoomed) {
    return step;
  }

  return { ...step, intents: [...step.intents, { kind: 'zoomed', zoomed: nowZoomed }] };
};

export const viewOf = (state: StageState): StageView => ({
  image: state.transform,
  track: state.track,
  pull: state.pull,
  motion: state.motion,
  phase: state.gesture.phase === 'ignored' ? 'idle' : state.gesture.phase,
});

const ZOOM_KEYS: Record<string, 1 | -1 | 0> = { '+': 1, '=': 1, '-': -1, '0': 0 };

const PAN_KEYS: Record<string, StagePoint> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

export const keyInputOf = (
  key: string,
  state: StageState,
  policy: StagePolicy,
): StageInput | null => {
  const direction = ZOOM_KEYS[key];
  if (direction !== undefined) {
    return { type: 'zoomKey', direction };
  }
  const pan = PAN_KEYS[key];
  if (pan === undefined || (policy.swipe && !isZoomed(state.transform))) {
    return null;
  }

  return { type: 'panKey', dx: pan.x, dy: pan.y };
};

export const cropOfStage = (state: StageState, policy: StagePolicy): KkCrop | null => {
  const frame = frameOf(state, policy);

  return frame === null ? null : cropInsidePicture(cropOf(state.transform, frame));
};

export const imageBoxOf = (
  state: StageState,
  policy: StagePolicy,
): { left: number; top: number; width: number; height: number } | null => {
  const frame = frameOf(state, policy);
  if (frame === null) {
    return null;
  }
  const fitted = fittedSizeOf(frame);

  return {
    left: (frame.stage.width - fitted.width) / 2,
    top: (frame.stage.height - fitted.height) / 2,
    width: fitted.width,
    height: fitted.height,
  };
};
