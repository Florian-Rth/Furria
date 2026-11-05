import type { KkPlanResizeHandle } from '@furria/ui/floor-plan-view';
import type { OrientedRect } from '@/features/hall-plan/plan-geometry';
import { toLocal, toWorld } from '@/features/hall-plan/plan-geometry';
import type { Point } from '@/features/hall-plan/schemas';

export const RESIZE_HANDLES: readonly KkPlanResizeHandle[] = [
  'nw',
  'n',
  'ne',
  'e',
  'se',
  's',
  'sw',
  'w',
];

export const isResizeHandle = (value: string | null): value is KkPlanResizeHandle =>
  value !== null && (RESIZE_HANDLES as readonly string[]).includes(value);

interface Span {
  min: number;
  max: number;
}

const resizedSpan = (span: Span, edge: -1 | 0 | 1, at: number, minimum: number): Span => {
  if (edge === -1) {
    return { min: Math.min(at, span.max - minimum), max: span.max };
  }
  if (edge === 1) {
    return { min: span.min, max: Math.max(at, span.min + minimum) };
  }

  return span;
};

const HORIZONTAL_EDGE: Record<KkPlanResizeHandle, -1 | 0 | 1> = {
  nw: -1,
  n: 0,
  ne: 1,
  e: 1,
  se: 1,
  s: 0,
  sw: -1,
  w: -1,
};

const VERTICAL_EDGE: Record<KkPlanResizeHandle, -1 | 0 | 1> = {
  nw: -1,
  n: -1,
  ne: -1,
  e: 0,
  se: 1,
  s: 1,
  sw: 1,
  w: 0,
};

export const resizeRect = (
  rect: OrientedRect,
  handle: KkPlanResizeHandle,
  at: Point,
  minimum: number,
): OrientedRect => {
  const local = toLocal(at, rect.center, rect.rotation);
  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;
  const across = resizedSpan(
    { min: -halfWidth, max: halfWidth },
    HORIZONTAL_EDGE[handle],
    local.x,
    minimum,
  );
  const down = resizedSpan(
    { min: -halfHeight, max: halfHeight },
    VERTICAL_EDGE[handle],
    local.y,
    minimum,
  );
  const localCenter = { x: (across.min + across.max) / 2, y: (down.min + down.max) / 2 };

  return {
    center: toWorld(localCenter, rect.center, rect.rotation),
    width: across.max - across.min,
    height: down.max - down.min,
    rotation: rect.rotation,
  };
};
