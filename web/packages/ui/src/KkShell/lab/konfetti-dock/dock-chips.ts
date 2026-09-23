import { pseudoRandom } from '../../../confetti-pieces';

export type DockChipLayer = 'behind' | 'front';

export type DockChipColor = 'red' | 'gold';

export interface DockChip {
  id: number;
  layer: DockChipLayer;
  color: DockChipColor;
  startShare: number;
  driftX: number;
  peakY: number;
  fallY: number;
  size: number;
  isRound: boolean;
  isSlim: boolean;
  spinDegrees: number;
  flipDegrees: number;
  delaySeconds: number;
  durationSeconds: number;
}

interface DockChipFlight {
  drift: readonly [number, number];
  peak: readonly [number, number];
  fall: readonly [number, number];
  size: readonly [number, number];
  duration: readonly [number, number];
}

export type DockChipCounts = Record<DockChipLayer, number>;

const COLORS: Record<DockChipLayer, readonly DockChipColor[]> = {
  behind: ['red', 'gold', 'gold', 'red'],
  front: ['gold', 'red'],
};

const LAYERS: readonly DockChipLayer[] = ['behind', 'front'];
const LAYER_SALT: Record<DockChipLayer, number> = { behind: 0, front: 7919 };
const BACKWARD_SHARE = 0.3;
const BACKWARD_PULL = -0.45;

const FLIGHT: Record<DockChipLayer, DockChipFlight> = {
  behind: {
    drift: [34, 120],
    peak: [2, 8],
    fall: [18, 36],
    size: [14, 18],
    duration: [0.66, 0.8],
  },
  front: {
    drift: [30, 210],
    peak: [18, 46],
    fall: [110, 230],
    size: [8, 12],
    duration: [0.7, 1],
  },
};

const within = (range: readonly [number, number], share: number): number =>
  range[0] + (range[1] - range[0]) * share;

const buildLayerChips = (
  layer: DockChipLayer,
  count: number,
  firstId: number,
  seed: number,
): DockChip[] =>
  Array.from({ length: count }, (_, index) => {
    const rng = (offset: number): number =>
      pseudoRandom(seed, LAYER_SALT[layer] + index * 17 + offset);
    const flight = FLIGHT[layer];
    const startShare = (index + 0.5) / count;
    const palette = COLORS[layer];
    const outward = startShare < BACKWARD_SHARE ? BACKWARD_PULL : 1;

    return {
      id: firstId + index,
      layer,
      color: palette[index % palette.length] ?? 'red',
      startShare,
      driftX: outward * within(flight.drift, rng(0)),
      peakY: -within(flight.peak, rng(1)),
      fallY: within(flight.fall, rng(2)),
      size: within(flight.size, rng(3)),
      isRound: index % 4 === 0,
      isSlim: index % 2 === 1,
      spinDegrees: (rng(4) > 0.5 ? 1 : -1) * (200 + rng(5) * 260),
      flipDegrees: (rng(6) > 0.5 ? 1 : -1) * (90 + rng(7) * 180),
      delaySeconds: rng(8) * (layer === 'front' ? 0.12 : 0.06),
      durationSeconds: within(flight.duration, rng(9)),
    };
  });

export const buildDockChips = (counts: DockChipCounts, seed: number): DockChip[] =>
  LAYERS.flatMap((layer) =>
    buildLayerChips(layer, counts[layer], layer === 'front' ? counts.behind : 0, seed),
  );
