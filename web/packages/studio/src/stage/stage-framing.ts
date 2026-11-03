import type { StageViewpoint } from '../models/stage-view';

export interface StageFrame {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface StageExtent {
  widthMetres: number;
  depthMetres: number;
}

export type StagePlaneStyle = Record<string, string>;

export const WHOLE_STAGE_FRAME: StageFrame = { left: 0, top: 0, width: 1, height: 1 };

const FRONT_ROOM = '1rem';
const DOT_ROOM = '1.25rem';
const HALF = 0.5;
const SCALE = '--kk-stage-metre';
const PERCENT = 100;

export const frameKeyOf = (frame: StageFrame): string =>
  [frame.left, frame.top, frame.width, frame.height].join(':');

export const frontAtTopOf = (viewpoint: StageViewpoint): boolean => viewpoint === 'dancers';

const scaleOf = (frame: StageFrame, stage: StageExtent): string => {
  const frameWidth = frame.width * stage.widthMetres;
  const frameDepth = frame.height * stage.depthMetres;

  return `min(calc((100cqw - 2 * ${DOT_ROOM}) / ${frameWidth}), calc((100cqh - ${FRONT_ROOM} - ${DOT_ROOM}) / ${frameDepth}))`;
};

const centreYOf = (frame: StageFrame, stage: StageExtent): number =>
  (frame.top + frame.height * HALF) * stage.depthMetres;

const roomTopOf = (viewpoint: StageViewpoint): string =>
  frontAtTopOf(viewpoint) ? FRONT_ROOM : '0px';

export const containedPlaneOf = (
  frame: StageFrame,
  stage: StageExtent,
  viewpoint: StageViewpoint,
): StagePlaneStyle => {
  const centreX = (frame.left + frame.width * HALF) * stage.widthMetres;

  return {
    [SCALE]: scaleOf(frame, stage),
    width: `calc(var(${SCALE}) * ${stage.widthMetres})`,
    height: `calc(var(${SCALE}) * ${stage.depthMetres})`,
    left: `calc(50cqw - var(${SCALE}) * ${centreX})`,
    top: `calc(${roomTopOf(viewpoint)} + (100cqh - ${FRONT_ROOM}) / 2 - var(${SCALE}) * ${centreYOf(frame, stage)})`,
  };
};

export const containedFrontOf = (
  frame: StageFrame,
  stage: StageExtent,
  viewpoint: StageViewpoint,
): StagePlaneStyle => {
  const scale = scaleOf(frame, stage);
  const centreY = centreYOf(frame, stage);

  if (frontAtTopOf(viewpoint)) {
    return {
      [SCALE]: scale,
      top: `max(0px, calc((100cqh - ${FRONT_ROOM}) / 2 - var(${SCALE}) * ${centreY}))`,
    };
  }

  const below = `calc((100cqh - ${FRONT_ROOM}) / 2 + var(${SCALE}) * ${stage.depthMetres - centreY})`;

  return { [SCALE]: scale, top: `min(calc(100cqh - ${FRONT_ROOM}), ${below})` };
};

export const placeOf = (x: number, y: number): StagePlaneStyle => ({
  transform: `translate3d(calc(${x * PERCENT}cqw - 50%), calc(${y * PERCENT}cqh - 50%), 0)`,
});
