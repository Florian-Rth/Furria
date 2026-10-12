export type KkViewerSlot = 'previous' | 'current' | 'next';

export interface KkViewerNeighbour {
  slot: KkViewerSlot;
  index: number;
  offset: -1 | 0 | 1;
}

export interface KkViewerWindow {
  start: number;
  end: number;
}

const VIEWER_SLOTS: readonly { slot: KkViewerSlot; offset: -1 | 0 | 1 }[] = [
  { slot: 'previous', offset: -1 },
  { slot: 'current', offset: 0 },
  { slot: 'next', offset: 1 },
];

export const VIEWER_PRELOAD_REACH = 2;

const isWithin = (index: number, count: number): boolean => index >= 0 && index < count;

export const neighboursOf = (index: number, count: number): KkViewerNeighbour[] =>
  VIEWER_SLOTS.map(({ slot, offset }) => ({ slot, offset, index: index + offset })).filter(
    (neighbour) => isWithin(neighbour.index, count),
  );

export const steppedIndexOf = (index: number, delta: number, count: number): number | null => {
  const stepped = index + delta;

  return stepped !== index && isWithin(stepped, count) ? stepped : null;
};

export const preloadPlanOf = (
  index: number,
  count: number,
  reach: number = VIEWER_PRELOAD_REACH,
): number[] =>
  Array.from({ length: reach }, (_, distance) => [index + distance + 1, index - distance - 1])
    .flat()
    .filter((planned) => isWithin(planned, count));

export const filmstripWindowOf = (index: number, count: number, reach: number): KkViewerWindow => {
  const span = Math.min(reach * 2 + 1, count);
  const start = Math.min(Math.max(index - reach, 0), Math.max(count - span, 0));

  return { start, end: start + span };
};
