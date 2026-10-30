import type { TimedKeyframe } from '@/features/act-player/choreography-motion';
import { poseAt } from '@/features/act-player/choreography-motion';
import type { TimelineRange } from '@/features/act-player/music-timeline';
import type { ViewShare } from '@/features/act-practice/practice-stage';
import { viewShareOf } from '@/features/act-practice/practice-stage';
import type { StudioStage } from '@/features/acts/schemas';

const ROOM_METRES = 1.2;
const STILL_METRES = 0.5;
const NEAREST_ZOOM = 1.7;
const SAMPLE_SECONDS = 0.5;
const SCALE_GRAIN = 20;
const SHIFT_GRAIN = 200;
const HALF = 0.5;
const PATH_SPOT_ID = 0;

export interface WayCamera {
  scale: number;
  x: number;
  y: number;
}

export const WHOLE_STAGE: WayCamera = { scale: 1, x: 0, y: 0 };

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

const shiftOf = (low: number, high: number, scale: number): number => {
  const half = HALF / scale;
  const centre = clamp((low + high) / 2, half, 1 - half);

  return Math.round((HALF - scale * centre) * SHIFT_GRAIN) / SHIFT_GRAIN;
};

export const cameraOf = (points: readonly ViewShare[], stage: StudioStage): WayCamera => {
  if (points.length === 0) {
    return WHOLE_STAGE;
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const still =
    (Math.max(...xs) - Math.min(...xs)) * stage.widthMetres < STILL_METRES &&
    (Math.max(...ys) - Math.min(...ys)) * stage.depthMetres < STILL_METRES;

  if (still) {
    return WHOLE_STAGE;
  }
  const left = Math.min(...xs) - ROOM_METRES / stage.widthMetres;
  const right = Math.max(...xs) + ROOM_METRES / stage.widthMetres;
  const top = Math.min(...ys) - ROOM_METRES / stage.depthMetres;
  const bottom = Math.max(...ys) + ROOM_METRES / stage.depthMetres;
  const fit = Math.min(1 / (right - left), 1 / (bottom - top));
  const scale = Math.floor(clamp(fit, 1, NEAREST_ZOOM) * SCALE_GRAIN) / SCALE_GRAIN;

  return scale <= 1
    ? WHOLE_STAGE
    : { scale, x: shiftOf(left, right, scale), y: shiftOf(top, bottom, scale) };
};

export const reachOf = (
  keyframes: readonly TimedKeyframe[],
  range: TimelineRange | null,
  stage: StudioStage,
): ViewShare[] => {
  if (range === null || keyframes.length === 0) {
    return [];
  }

  const path = { spotId: PATH_SPOT_ID, keyframes };
  const samples = Math.max(1, Math.ceil((range.end - range.start) / SAMPLE_SECONDS));
  const times = Array.from(
    { length: samples + 1 },
    (_, index) => range.start + ((range.end - range.start) * index) / samples,
  );

  return times.flatMap((seconds) => {
    const pose = poseAt(path, seconds);

    return pose === null ? [] : [viewShareOf(pose.position, stage)];
  });
};
