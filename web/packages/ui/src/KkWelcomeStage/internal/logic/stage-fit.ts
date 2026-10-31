const NO_SCALE = 1;

export interface StageFitBounds {
  least: number;
  most: number;
}

export interface StageBox {
  width: number;
  height: number;
}

export const stageScaleOf = (room: StageBox, face: StageBox, bounds: StageFitBounds): number => {
  if (face.width <= 0 || face.height <= 0 || room.width <= 0 || room.height <= 0) {
    return NO_SCALE;
  }

  const fitting = Math.min(room.width / face.width, room.height / face.height);

  return Math.min(Math.max(fitting, bounds.least), bounds.most);
};
