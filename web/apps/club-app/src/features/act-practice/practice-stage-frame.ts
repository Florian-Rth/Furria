import type { SpotPath } from '@/features/act-player/choreography-motion';
import { poseAt } from '@/features/act-player/choreography-motion';
import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';
import type { StudioStage } from '@/features/acts/schemas';
import type { ViewShare } from './practice-stage';
import { viewShareOf } from './practice-stage';

const PAD_METRES = 1.25;
const MIN_SHARE = 0.4;
const GRAIN = 1000;
const HALF = 0.5;

export interface StageFrame {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const WHOLE_STAGE_FRAME: StageFrame = { left: 0, top: 0, width: 1, height: 1 };

const rounded = (value: number): number => Math.round(value * GRAIN) / GRAIN;

const spanOf = (low: number, high: number, pad: number): [number, number] => {
  const padded = [Math.max(0, low - pad), Math.min(1, high + pad)] as const;
  const width = Math.max(MIN_SHARE, padded[1] - padded[0]);
  const centre = (padded[0] + padded[1]) * HALF;
  const start = Math.min(1 - width, Math.max(0, centre - width * HALF));

  return [rounded(start), rounded(width)];
};

export const stageFrameOf = (
  paths: readonly SpotPath[],
  marks: readonly CountMark[],
  range: TimelineRange | null,
  stage: StudioStage,
): StageFrame => {
  if (range === null || paths.length === 0) {
    return WHOLE_STAGE_FRAME;
  }

  const times = [
    range.start,
    ...marks
      .filter((mark) => mark.seconds > range.start && mark.seconds < range.end)
      .map((mark) => mark.seconds),
    range.end,
  ];
  const places: ViewShare[] = paths.flatMap((path) =>
    times.flatMap((time) => {
      const pose = poseAt(path, time);
      return pose === null ? [] : [viewShareOf(pose.position, stage)];
    }),
  );

  if (places.length === 0) {
    return WHOLE_STAGE_FRAME;
  }

  const xs = places.map((place) => place.x);
  const ys = places.map((place) => place.y);
  const [left, width] = spanOf(Math.min(...xs), Math.max(...xs), PAD_METRES / stage.widthMetres);
  const [top, height] = spanOf(Math.min(...ys), Math.max(...ys), PAD_METRES / stage.depthMetres);

  return { left, top, width, height };
};

export const frameKeyOf = (frame: StageFrame): string =>
  [frame.left, frame.top, frame.width, frame.height].join(':');
