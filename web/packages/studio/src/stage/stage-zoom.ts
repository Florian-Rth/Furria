import type { GesturePoint } from '../gestures/gesture-recogniser';
import type { StageFrame } from './stage-framing';
import { WHOLE_STAGE_FRAME } from './stage-framing';

export interface StageShare {
  x: number;
  y: number;
}

export interface StageBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface StageView {
  frame: StageFrame;
  plane: StageBox;
}

export const MAX_STAGE_ZOOM = 6;
export const QUARTER_GRID_ZOOM = 2;

const HALF = 0.5;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const shareOfAreaPoint = (point: GesturePoint, plane: StageBox): StageShare => ({
  x: plane.width <= 0 ? 0 : (point.x - plane.left) / plane.width,
  y: plane.height <= 0 ? 0 : (point.y - plane.top) / plane.height,
});

export const areaPointOfShare = (share: StageShare, plane: StageBox): GesturePoint => ({
  x: plane.left + share.x * plane.width,
  y: plane.top + share.y * plane.height,
});

export const stageZoomOf = (frame: StageFrame): number => 1 / Math.max(frame.width, frame.height);

const centreOf = (frame: StageFrame): StageShare => ({
  x: frame.left + frame.width * HALF,
  y: frame.top + frame.height * HALF,
});

export const zoomedStageViewOf = (
  view: StageView,
  focal: GesturePoint,
  ratio: number,
  pan: GesturePoint,
): StageView => {
  const { frame, plane } = view;
  const size = clamp(frame.width / ratio, 1 / MAX_STAGE_ZOOM, 1);
  const applied = frame.width / size;
  const width = plane.width * applied;
  const height = plane.height * applied;
  const held = shareOfAreaPoint({ x: focal.x - pan.x, y: focal.y - pan.y }, plane);
  const left = focal.x - held.x * width;
  const top = focal.y - held.y * height;
  const anchor = areaPointOfShare(centreOf(frame), plane);
  const centre = {
    x: clamp((anchor.x - left) / width, size * HALF, 1 - size * HALF),
    y: clamp((anchor.y - top) / height, size * HALF, 1 - size * HALF),
  };
  const fitted =
    size >= 1
      ? WHOLE_STAGE_FRAME
      : { left: centre.x - size * HALF, top: centre.y - size * HALF, width: size, height: size };
  const kept = centreOf(fitted);

  return {
    frame: fitted,
    plane: { left: anchor.x - kept.x * width, top: anchor.y - kept.y * height, width, height },
  };
};
