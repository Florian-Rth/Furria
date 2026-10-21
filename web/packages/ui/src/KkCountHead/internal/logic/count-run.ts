import { kkTokens } from '../../../tokens';

export type CountCell =
  | { kind: 'tile'; face: string; order: number }
  | { kind: 'mark'; face: string };

export interface CountRun {
  start: number;
  faces: string[];
  durations: number[];
}

export interface CountFrame {
  from: string;
  to: string;
  progress: number;
}

export const BLANK_FACE = '';
export const STAR_FACE = '✶';
export type CountFaceVisibility = 'visible' | 'hidden';

export const starVisibilityOf = (face: string): CountFaceVisibility =>
  face === STAR_FACE ? 'visible' : 'hidden';

const STAR_HOLDER = '0';

export const letterFaceOf = (face: string): string => (face === STAR_FACE ? STAR_HOLDER : face);

export const letterVisibilityOf = (face: string): CountFaceVisibility =>
  face === STAR_FACE ? 'hidden' : 'visible';

const { faceMs, finalMs, staggerMs } = kkTokens.motion.flap;
const DIGITS: readonly string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const BASE_FLIPS = 4;
const MAX_FLIPS = 8;

const isTileFace = (face: string): boolean =>
  face === STAR_FACE || DIGITS.some((digit) => digit === face);

export const countCellsOf = (numeral: string): CountCell[] => {
  let order = 0;

  return Array.from(numeral).map((face): CountCell => {
    if (!isTileFace(face)) {
      return { kind: 'mark', face };
    }

    const cell: CountCell = { kind: 'tile', face, order };
    order += 1;

    return cell;
  });
};

const rollBefore = (face: string, flips: number): string[] => {
  const landing = face === STAR_FACE ? DIGITS.length : DIGITS.indexOf(face);

  return Array.from({ length: flips - 1 }, (_, step) => {
    const back = flips - 1 - step;

    return DIGITS[(landing - back + DIGITS.length * MAX_FLIPS) % DIGITS.length] ?? BLANK_FACE;
  });
};

export const arrivalRunOf = (face: string, order: number): CountRun => {
  const flips = Math.min(BASE_FLIPS + order, MAX_FLIPS);

  return {
    start: order * staggerMs,
    faces: [BLANK_FACE, ...rollBefore(face, flips), face],
    durations: [...Array.from({ length: flips - 1 }, () => faceMs), finalMs],
  };
};

export const tickRunOf = (from: string, to: string): CountRun => ({
  start: 0,
  faces: [from, to],
  durations: [finalMs],
});

export const runEndOf = (run: CountRun): number =>
  run.durations.reduce((end, duration) => end + duration, run.start);

export const countFrameAt = (run: CountRun, elapsed: number): CountFrame => {
  const first = run.faces[0] ?? BLANK_FACE;
  const last = run.faces.at(-1) ?? BLANK_FACE;
  let local = elapsed - run.start;

  if (local < 0) {
    return { from: first, to: first, progress: 0 };
  }

  for (const [step, duration] of run.durations.entries()) {
    if (local < duration) {
      return {
        from: run.faces[step] ?? BLANK_FACE,
        to: run.faces[step + 1] ?? BLANK_FACE,
        progress: local / duration,
      };
    }
    local -= duration;
  }

  return { from: last, to: last, progress: 1 };
};

export const turnedTilesOf = (previous: string, next: string): boolean[] | null => {
  const before = countCellsOf(previous);
  const after = countCellsOf(next);
  const sameShape =
    before.length === after.length &&
    before.every((cell, index) => cell.kind === after[index]?.kind);

  return sameShape ? after.map((cell, index) => cell.face !== before[index]?.face) : null;
};

export const markRevealAtOf = (cells: readonly CountCell[], index: number): number => {
  const landed = cells
    .slice(0, index)
    .filter((cell): cell is Extract<CountCell, { kind: 'tile' }> => cell.kind === 'tile')
    .at(-1);

  return landed === undefined ? 0 : runEndOf(arrivalRunOf(landed.face, landed.order));
};
