import type { StagePoint } from '@furria/studio/choreography-motion';
import type { GesturePoint } from '@furria/studio/gesture-recogniser';
import type { StudioStage } from '@furria/studio/studio-schemas';

export interface StageFrame {
  scale: number;
  x: number;
  y: number;
}

export type GridLineKind = 'metre' | 'quarter' | 'centre';

export interface GridLine {
  at: number;
  kind: GridLineKind;
}

export interface StageSnap {
  point: StagePoint;
  snapRight: number | null;
  snapBack: number | null;
}

export const GRID_METRES = 0.25;
export const STAGE_SNAP_PX = 10;
const FRAME_PADDING = 24;
const MAX_ZOOM = 6;
const MIN_QUARTER_PX = 14;

export const fitFrame = (stage: StudioStage, width: number, height: number): StageFrame => {
  const scale = Math.max(
    Math.min(
      (width - FRAME_PADDING * 2) / stage.widthMetres,
      (height - FRAME_PADDING * 2) / stage.depthMetres,
    ),
    1,
  );

  return {
    scale,
    x: (width - stage.widthMetres * scale) / 2,
    y: (height - stage.depthMetres * scale) / 2,
  };
};

export const zoomedFrame = (
  frame: StageFrame,
  fit: StageFrame,
  ratio: number,
  focal: GesturePoint,
  dx: number,
  dy: number,
): StageFrame => {
  const scale = Math.min(Math.max(frame.scale * ratio, fit.scale), fit.scale * MAX_ZOOM);
  const applied = scale / frame.scale;

  return {
    scale,
    x: focal.x - (focal.x - frame.x) * applied + dx,
    y: focal.y - (focal.y - frame.y) * applied + dy,
  };
};

export const pxOfStagePoint = (
  point: StagePoint,
  stage: StudioStage,
  frame: StageFrame,
): GesturePoint => ({
  x: frame.x + (stage.widthMetres / 2 + point.rightMetres) * frame.scale,
  y: frame.y + (stage.depthMetres - point.backMetres) * frame.scale,
});

export const stagePointOfPx = (
  px: GesturePoint,
  stage: StudioStage,
  frame: StageFrame,
): StagePoint => ({
  rightMetres: (px.x - frame.x) / frame.scale - stage.widthMetres / 2,
  backMetres: stage.depthMetres - (px.y - frame.y) / frame.scale,
});

export const metresOfDelta = (delta: GesturePoint, frame: StageFrame): StagePoint => ({
  rightMetres: delta.x / frame.scale,
  backMetres: -delta.y / frame.scale,
});

const snapAxis = (metres: number, scale: number, snapPx: number): number | null => {
  const nearest = Math.round(metres / GRID_METRES) * GRID_METRES;

  return Math.abs(nearest - metres) * scale <= snapPx ? nearest : null;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const snappedStagePoint = (
  point: StagePoint,
  stage: StudioStage,
  frame: StageFrame,
  snapping: boolean,
  snapPx: number = STAGE_SNAP_PX,
): StageSnap => {
  const kept = {
    rightMetres: clamp(point.rightMetres, -stage.widthMetres / 2, stage.widthMetres / 2),
    backMetres: clamp(point.backMetres, 0, stage.depthMetres),
  };
  if (!snapping) {
    return { point: kept, snapRight: null, snapBack: null };
  }
  const snapRight = snapAxis(kept.rightMetres, frame.scale, snapPx);
  const snapBack = snapAxis(kept.backMetres, frame.scale, snapPx);

  return {
    point: {
      rightMetres: snapRight ?? kept.rightMetres,
      backMetres: snapBack ?? kept.backMetres,
    },
    snapRight,
    snapBack,
  };
};

const linesOf = (count: number, quarters: boolean, centre: number | null): GridLine[] => {
  const step = quarters ? GRID_METRES : 1;
  const lines: GridLine[] = [];
  for (let at = 0; at <= count + 1e-9; at += step) {
    const whole = Math.abs(at - Math.round(at)) < 1e-9;
    const isCentre = centre !== null && Math.abs(at - centre) < 1e-9;
    lines.push({ at, kind: isCentre ? 'centre' : whole ? 'metre' : 'quarter' });
  }

  return lines;
};

export const gridLinesOf = (
  stage: StudioStage,
  frame: StageFrame,
): { columns: GridLine[]; rows: GridLine[] } => {
  const quarters = frame.scale * GRID_METRES >= MIN_QUARTER_PX;

  return {
    columns: linesOf(stage.widthMetres, quarters, stage.widthMetres / 2).map((line) => ({
      ...line,
      at: frame.x + line.at * frame.scale,
    })),
    rows: linesOf(stage.depthMetres, quarters, null).map((line) => ({
      ...line,
      at: frame.y + line.at * frame.scale,
    })),
  };
};
