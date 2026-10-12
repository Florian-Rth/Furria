const FRAME_TILTS = [-2, 1.5, -1, 2, -1.5, 1, -2.5, 2] as const;
const FIRST_POSITION = 1;
const UPRIGHT = 0;

export interface FilmstripFrame {
  position: number;
  transform: string;
}

const tiltAt = (position: number): number =>
  FRAME_TILTS[(position - FIRST_POSITION) % FRAME_TILTS.length] ?? UPRIGHT;

export const filmstripFramesOf = (positions: readonly number[]): FilmstripFrame[] =>
  positions.map((position) => ({ position, transform: `rotate(${tiltAt(position)}deg)` }));
