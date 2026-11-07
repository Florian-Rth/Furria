export type StageNameSize = 'large' | 'small';

export interface StageNameSpot {
  key: string;
  x: number;
  y: number;
  name: string;
}

export interface StageBox {
  width: number;
  height: number;
}

export interface StageNamePlace {
  dx: number;
  dy: number;
  size: StageNameSize;
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Offset {
  dx: number;
  dy: number;
}

const DOT_RADIUS = 12;
const GAP = 3;
const EDGE_ROOM = 2;
const CHAR_WIDTH: Record<StageNameSize, number> = { large: 8.4, small: 7.2 };
const PADDING: Record<StageNameSize, number> = { large: 14, small: 10 };
const HEIGHT: Record<StageNameSize, number> = { large: 20, small: 17 };
const MOST_WIDTH: Record<StageNameSize, number> = { large: 120, small: 72 };
const SIZES: readonly StageNameSize[] = ['large', 'small'];

const labelSizeOf = (name: string, size: StageNameSize): StageBox => ({
  width: Math.min(MOST_WIDTH[size], name.length * CHAR_WIDTH[size] + PADDING[size]),
  height: HEIGHT[size],
});

const offsetsOf = (label: StageBox): readonly Offset[] => {
  const above = -(DOT_RADIUS + GAP + label.height / 2);
  const below = DOT_RADIUS + GAP + label.height / 2;
  const side = DOT_RADIUS + GAP + label.width / 2;
  const far = label.height + GAP;

  const corner = label.width / 2 + GAP;

  return [
    { dx: 0, dy: above },
    { dx: 0, dy: below },
    { dx: side, dy: 0 },
    { dx: -side, dy: 0 },
    { dx: corner, dy: above },
    { dx: -corner, dy: above },
    { dx: corner, dy: below },
    { dx: -corner, dy: below },
    { dx: 0, dy: above - far },
    { dx: 0, dy: below + far },
  ];
};

const rectOf = (x: number, y: number, box: StageBox): Rect => ({
  left: x - box.width / 2,
  top: y - box.height / 2,
  right: x + box.width / 2,
  bottom: y + box.height / 2,
});

const overlapOf = (first: Rect, second: Rect): number =>
  Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left)) *
  Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top));

const outsideOf = (rect: Rect, stage: StageBox): number =>
  Math.max(0, -EDGE_ROOM - rect.left) +
  Math.max(0, rect.right - stage.width - EDGE_ROOM) +
  Math.max(0, -EDGE_ROOM - rect.top) +
  Math.max(0, rect.bottom - stage.height - EDGE_ROOM);

const DOT_WEIGHT = 4;

const shiftInto = (low: number, high: number, limit: number): number =>
  Math.max(0, EDGE_ROOM - low) - Math.max(0, high - (limit - EDGE_ROOM));

const insideOf = (rect: Rect, stage: StageBox): Offset => ({
  dx: (rect.left + rect.right) / 2 + shiftInto(rect.left, rect.right, stage.width),
  dy: (rect.top + rect.bottom) / 2 + shiftInto(rect.top, rect.bottom, stage.height),
});

interface Trial {
  place: StageNamePlace;
  rect: Rect;
  cost: number;
}

export const stageNamesOf = (
  spots: readonly StageNameSpot[],
  stage: StageBox,
  preferred: StageNameSize,
): ReadonlyMap<string, StageNamePlace> => {
  const dots = spots.map((spot) =>
    rectOf(spot.x * stage.width, spot.y * stage.height, {
      width: DOT_RADIUS * 2,
      height: DOT_RADIUS * 2,
    }),
  );
  const taken: Rect[] = [];
  const places = new Map<string, StageNamePlace>();
  const sizes = preferred === 'large' ? SIZES : (['small'] as const);
  const ordered = [...spots].sort((left, right) => left.y - right.y || left.x - right.x);
  for (const spot of ordered) {
    const cx = spot.x * stage.width;
    const cy = spot.y * stage.height;
    const trials: Trial[] = sizes.flatMap((size, sizeRank) => {
      const label = labelSizeOf(spot.name, size);

      return offsetsOf(label).map((offset, rank) => {
        const inside = insideOf(rectOf(cx + offset.dx, cy + offset.dy, label), stage);
        const rect = rectOf(inside.dx, inside.dy, label);
        const covered = dots.reduce((sum, other) => sum + overlapOf(rect, other), 0);
        const crowded = taken.reduce((sum, other) => sum + overlapOf(rect, other), 0);
        const clash = covered * DOT_WEIGHT + crowded + outsideOf(rect, stage) * label.height;

        return {
          place: { dx: inside.dx - cx, dy: inside.dy - cy, size },
          rect,
          cost: clash * 1000 + sizeRank * 100 + rank,
        };
      });
    });
    const best = trials.reduce((winner, trial) => (trial.cost < winner.cost ? trial : winner));
    taken.push(best.rect);
    places.set(spot.key, best.place);
  }

  return places;
};
