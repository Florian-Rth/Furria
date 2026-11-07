import type { GesturePoint } from '../gestures/gesture-recogniser';
import type { HitTarget } from '../gestures/hit-priority';
import { pickHitTarget } from '../gestures/hit-priority';

export interface CentreTarget {
  key: string;
  seconds: number;
  until?: number | null;
  lane?: string | null;
  movable?: boolean;
  tappable?: boolean;
  snaps?: boolean;
}

export interface LaneBand {
  top: number;
  height: number;
}

export type CentreTargetUse = 'drag' | 'tap';

const EDGE_WIDTH = 2;
const EDGE_PRIORITY = 1;
const SPAN_PRIORITY = 0;

const usableFor = (target: CentreTarget, use: CentreTargetUse): boolean =>
  use === 'drag' ? (target.movable ?? true) : (target.tappable ?? false);

export const targetHitsOf = (
  targets: readonly CentreTarget[],
  offset: number,
  pxPerSecond: number,
  height: number,
  bands: ReadonlyMap<string, LaneBand>,
  activeKey: string | null,
): HitTarget<string>[] =>
  targets.flatMap((target) => {
    const lane = target.lane ?? null;
    const band = lane === null ? { top: 0, height } : bands.get(lane);
    if (band === undefined) {
      return [];
    }
    const start = offset + target.seconds * pxPerSecond;
    const until = target.until ?? null;
    const span = until === null ? null : Math.max(0, (until - target.seconds) * pxPerSecond);

    return [
      {
        id: target.key,
        x: span === null ? start - EDGE_WIDTH / 2 : start,
        y: band.top,
        width: span ?? EDGE_WIDTH,
        height: band.height,
        priority: span === null ? EDGE_PRIORITY : SPAN_PRIORITY,
        selected: target.key === activeKey,
      },
    ];
  });

export const pickCentreTarget = (
  targets: readonly CentreTarget[],
  hits: readonly HitTarget<string>[],
  point: GesturePoint,
  use: CentreTargetUse,
): CentreTarget | null => {
  const usable = new Set(
    targets.filter((target) => usableFor(target, use)).map((target) => target.key),
  );
  const key = pickHitTarget(
    hits.filter((hit) => usable.has(hit.id)),
    point,
  );

  return targets.find((target) => target.key === key) ?? null;
};
