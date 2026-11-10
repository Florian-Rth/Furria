export interface CanvasRoom {
  width: number;
  height: number;
}

export const canvasScaleOf = (room: CanvasRoom, canvas: CanvasRoom): number => {
  if (room.width <= 0 || room.height <= 0) {
    return 1;
  }

  return Math.min(room.width / canvas.width, room.height / canvas.height);
};
