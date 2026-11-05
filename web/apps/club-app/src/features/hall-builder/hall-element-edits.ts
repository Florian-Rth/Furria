import { add, distanceBetween, scale, subtract } from '@/features/hall-plan/plan-geometry';
import type { DoorElement } from '@/features/hall-plan/schemas';

export const MEASURE_LIMITS = {
  size: { min: 10, max: 10000 },
  thickness: { min: 1, max: 200 },
  door: { min: 20, max: 2000 },
  rotation: { min: 0, max: 359 },
} as const;

export const withDoorWidth = (door: DoorElement, width: number): DoorElement => {
  const length = distanceBetween(door.from, door.to);
  if (length === 0) {
    return { ...door, to: add(door.from, { x: width, y: 0 }) };
  }

  return { ...door, to: add(door.from, scale(subtract(door.to, door.from), width / length)) };
};

export const labelOrNull = (text: string): string | null => {
  const trimmed = text.trim();

  return trimmed === '' ? null : text;
};
