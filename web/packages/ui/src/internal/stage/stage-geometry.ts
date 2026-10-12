import type { KkSize } from '../../image-aspect';
import type { KkCrop } from '../../image-crop';

export type StageFit = 'contain' | 'cover';

export interface StagePoint {
  x: number;
  y: number;
}

export interface StageTransform {
  x: number;
  y: number;
  zoom: number;
}

export interface StageFrame {
  stage: KkSize;
  image: KkSize;
  fit: StageFit;
}

export interface StageEdges {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export const STAGE_REST: StageTransform = { x: 0, y: 0, zoom: 1 };

const MIN_ZOOM = 1;
const RUBBER_STIFFNESS = 0.55;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const fittedSizeOf = ({ stage, image, fit }: StageFrame): KkSize => {
  const widthScale = stage.width / image.width;
  const heightScale = stage.height / image.height;
  const scale =
    fit === 'contain' ? Math.min(widthScale, heightScale) : Math.max(widthScale, heightScale);

  return { width: image.width * scale, height: image.height * scale };
};

const slackOf = (shown: number, stage: number): number => Math.max((shown - stage) / 2, 0);

export const edgesOf = (transform: StageTransform, frame: StageFrame): StageEdges => {
  const fitted = fittedSizeOf(frame);
  const slackX = slackOf(fitted.width * transform.zoom, frame.stage.width);
  const slackY = slackOf(fitted.height * transform.zoom, frame.stage.height);

  return { minX: -slackX, maxX: slackX, minY: -slackY, maxY: slackY };
};

export const clampZoom = (zoom: number, maxZoom: number): number =>
  clamp(zoom, MIN_ZOOM, Math.max(maxZoom, MIN_ZOOM));

export const clampTransform = (
  transform: StageTransform,
  frame: StageFrame,
  maxZoom: number,
): StageTransform => {
  const zoom = clampZoom(transform.zoom, maxZoom);
  const edges = edgesOf({ ...transform, zoom }, frame);

  return {
    x: clamp(transform.x, edges.minX, edges.maxX),
    y: clamp(transform.y, edges.minY, edges.maxY),
    zoom,
  };
};

export const rubberBand = (overshoot: number, dimension: number): number => {
  if (dimension <= 0) {
    return 0;
  }
  const reach = (1 - 1 / ((Math.abs(overshoot) * RUBBER_STIFFNESS) / dimension + 1)) * dimension;

  return Math.sign(overshoot) * reach;
};

const rubberAxis = (value: number, min: number, max: number, dimension: number): number => {
  if (value < min) {
    return min + rubberBand(value - min, dimension);
  }
  if (value > max) {
    return max + rubberBand(value - max, dimension);
  }

  return value;
};

export const rubberClamp = (transform: StageTransform, frame: StageFrame): StageTransform => {
  const edges = edgesOf(transform, frame);

  return {
    x: rubberAxis(transform.x, edges.minX, edges.maxX, frame.stage.width),
    y: rubberAxis(transform.y, edges.minY, edges.maxY, frame.stage.height),
    zoom: transform.zoom,
  };
};

export const zoomAbout = (
  transform: StageTransform,
  zoom: number,
  focal: StagePoint,
): StageTransform => {
  const ratio = zoom / transform.zoom;

  return {
    x: focal.x - (focal.x - transform.x) * ratio,
    y: focal.y - (focal.y - transform.y) * ratio,
    zoom,
  };
};

export const cropOf = (transform: StageTransform, frame: StageFrame): KkCrop => {
  const fitted = fittedSizeOf(frame);
  const shownWidth = fitted.width * transform.zoom;
  const shownHeight = fitted.height * transform.zoom;

  return {
    left: (shownWidth / 2 - transform.x - frame.stage.width / 2) / shownWidth,
    top: (shownHeight / 2 - transform.y - frame.stage.height / 2) / shownHeight,
    width: frame.stage.width / shownWidth,
    height: frame.stage.height / shownHeight,
  };
};

export const transformOfCrop = (crop: KkCrop, frame: StageFrame): StageTransform => {
  const fitted = fittedSizeOf(frame);
  const zoom = frame.stage.width / (crop.width * fitted.width);
  const shownWidth = fitted.width * zoom;
  const shownHeight = fitted.height * zoom;

  return {
    x: shownWidth / 2 - frame.stage.width / 2 - crop.left * shownWidth,
    y: shownHeight / 2 - frame.stage.height / 2 - crop.top * shownHeight,
    zoom,
  };
};
