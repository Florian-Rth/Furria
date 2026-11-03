import type { GesturePoint } from './gesture-recogniser';

export interface HitBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HitTarget<Id> extends HitBox {
  id: Id;
  priority: number;
  selected: boolean;
}

export const HIT_MIN_SIZE = 44;

export const hitAreaOf = (box: HitBox): HitBox => {
  const width = Math.max(box.width, HIT_MIN_SIZE);
  const height = Math.max(box.height, HIT_MIN_SIZE);

  return {
    x: box.x - (width - box.width) / 2,
    y: box.y - (height - box.height) / 2,
    width,
    height,
  };
};

const contains = (box: HitBox, point: GesturePoint): boolean =>
  point.x >= box.x &&
  point.x <= box.x + box.width &&
  point.y >= box.y &&
  point.y <= box.y + box.height;

const distanceToBox = (box: HitBox, point: GesturePoint): number =>
  Math.hypot(
    Math.max(box.x - point.x, 0, point.x - (box.x + box.width)),
    Math.max(box.y - point.y, 0, point.y - (box.y + box.height)),
  );

const distanceToCentre = (box: HitBox, point: GesturePoint): number =>
  Math.hypot(point.x - (box.x + box.width / 2), point.y - (box.y + box.height / 2));

const rank = <Id>(first: HitTarget<Id>, second: HitTarget<Id>, point: GesturePoint): number =>
  Number(second.selected) - Number(first.selected) ||
  second.priority - first.priority ||
  distanceToBox(first, point) - distanceToBox(second, point) ||
  distanceToCentre(first, point) - distanceToCentre(second, point);

export const pickHitTarget = <Id>(
  targets: readonly HitTarget<Id>[],
  point: GesturePoint,
): Id | null => {
  const hits = targets.filter((target) => contains(hitAreaOf(target), point));
  const [best] = hits.toSorted((first, second) => rank(first, second, point));

  return best === undefined ? null : best.id;
};
