export const stickyOffsetOf = (panX: number, bandLeft: number, room: number): number =>
  Math.min(Math.max(-(panX + bandLeft), 0), Math.max(room, 0));
