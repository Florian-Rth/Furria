export type FocusNameSide = 'below' | 'above' | 'none';

export interface FocusNamePoint {
  spotId: number;
  x: number;
  y: number;
}

const NAME_SPAN_SHARE = 0.13;
const ROW_SPAN_SHARE = 0.09;

const crowds = (left: FocusNamePoint, right: FocusNamePoint): boolean =>
  Math.abs(left.x - right.x) < NAME_SPAN_SHARE && Math.abs(left.y - right.y) < ROW_SPAN_SHARE;

export const nameSidesOf = (
  points: readonly FocusNamePoint[],
  selected: readonly number[],
): Map<number, FocusNameSide> => {
  const placed: { point: FocusNamePoint; side: FocusNameSide }[] = [];
  const ordered = [...points].sort((left, right) => left.x - right.x);

  for (const point of ordered) {
    const taken = (side: FocusNameSide): boolean =>
      placed.some((other) => other.side === side && crowds(other.point, point));
    const free: FocusNameSide = !taken('below') ? 'below' : taken('above') ? 'none' : 'above';
    const side: FocusNameSide = free === 'none' && selected.includes(point.spotId) ? 'below' : free;
    placed.push({ point, side });
  }

  return new Map(placed.map((entry) => [entry.point.spotId, entry.side]));
};
