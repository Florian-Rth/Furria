import type { PanBounds } from '@furria/studio/pan-bounds';
import type { StudioStep } from '@furria/studio/studio-schemas';

export interface RailItem {
  stepId: number;
  name: string;
  start: number;
  end: number;
  left: number;
  width: number;
}

export const RAIL_PX_PER_SECOND = 9;
export const RAIL_MIN_WIDTH = 92;

export const railItemsOf = (steps: readonly StudioStep[]): RailItem[] => {
  let left = 0;

  return steps
    .flatMap((step) =>
      step.startSeconds === null || step.endSeconds === null || step.placement !== 'onTimeline'
        ? []
        : [
            {
              stepId: step.stepId,
              name: step.name,
              start: step.startSeconds,
              end: step.endSeconds,
            },
          ],
    )
    .sort((first, second) => first.start - second.start)
    .map((step) => {
      const width = Math.max((step.end - step.start) * RAIL_PX_PER_SECOND, RAIL_MIN_WIDTH);
      const item = { ...step, left, width };
      left += width;

      return item;
    });
};

export const railOffsetOf = (item: RailItem, areaWidth: number): number =>
  areaWidth / 2 - (item.left + item.width / 2);

export const railBoundsOf = (items: readonly RailItem[], areaWidth: number): PanBounds => {
  const first = items[0];
  const last = items.at(-1);

  return first === undefined || last === undefined
    ? { min: 0, max: 0 }
    : { min: railOffsetOf(last, areaWidth), max: railOffsetOf(first, areaWidth) };
};

export const railItemAt = (items: readonly RailItem[], contentX: number): RailItem | null =>
  items.find((item) => contentX >= item.left && contentX < item.left + item.width) ?? null;

export const nearestRailOffset = (
  items: readonly RailItem[],
  areaWidth: number,
  offset: number,
): number => {
  let best: number | null = null;
  for (const item of items) {
    const candidate = railOffsetOf(item, areaWidth);
    if (best === null || Math.abs(candidate - offset) < Math.abs(best - offset)) {
      best = candidate;
    }
  }

  return best ?? offset;
};

export const railItemPlaying = (items: readonly RailItem[], seconds: number): RailItem | null =>
  items.find((item) => seconds >= item.start && seconds < item.end) ?? null;
