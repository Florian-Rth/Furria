import type {
  GestureDragMove,
  GesturePoint,
  GesturePolicy,
  GesturePrecisionAxis,
  GesturePrecisionTier,
} from '@furria/studio/gesture-recogniser';
import type { StudioLabPrecision } from './schemas';

export interface LabDragStep {
  delta: GesturePoint;
  tier: GesturePrecisionTier;
}

export const HELD_FACTOR = 0.25;

export const labPolicyOf = (
  precision: StudioLabPrecision,
  axis: GesturePrecisionAxis,
): GesturePolicy => ({
  drag: true,
  navigate: true,
  longPress: true,
  precision: precision === 'distance' ? axis : 'none',
});

export const labDragStepOf = (
  precision: StudioLabPrecision,
  move: GestureDragMove,
): LabDragStep => {
  if (precision === 'distance') {
    return { delta: move.delta, tier: move.precision };
  }

  return move.held
    ? { delta: { x: move.delta.x * HELD_FACTOR, y: move.delta.y * HELD_FACTOR }, tier: 'quarter' }
    : { delta: move.delta, tier: 'full' };
};
