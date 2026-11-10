const CASCADE_SECONDS = 1.8;
const LONGEST_STEP = 0.06;
const FRESH_PAUSE = 0.5;
const FRESH_STEP = 0.35;

export interface WallEntry {
  fresh: boolean;
}

export const wallDelaysOf = (entries: readonly WallEntry[], start: number): number[] => {
  const settled = entries.filter((entry) => !entry.fresh).length;
  const step = settled === 0 ? 0 : Math.min(LONGEST_STEP, CASCADE_SECONDS / settled);
  const freshStart = start + settled * step + FRESH_PAUSE;
  let settledIndex = 0;
  let freshIndex = 0;

  return entries.map((entry) => {
    if (entry.fresh) {
      freshIndex += 1;
      return freshStart + (freshIndex - 1) * FRESH_STEP;
    }
    settledIndex += 1;
    return start + (settledIndex - 1) * step;
  });
};

export const wallScaleOf = (room: number, content: number): number =>
  content <= 0 || content <= room ? 1 : room / content;
