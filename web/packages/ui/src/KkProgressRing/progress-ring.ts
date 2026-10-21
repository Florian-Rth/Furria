import type { KkStepState } from '../KkStatePill/step-state';

export const RING_LENGTH = 100;

export interface KkProgressRingPart {
  state: KkStepState;
  count: number;
}

export interface RingSegment {
  state: KkStepState;
  dash: string;
  offset: number;
}

const DRAWN_STATES: ReadonlySet<KkStepState> = new Set(['done', 'overdue', 'current', 'open']);

export const ringSegmentsOf = (
  parts: readonly KkProgressRingPart[],
  gap: number,
): RingSegment[] => {
  const total = parts.reduce((sum, part) => sum + Math.max(part.count, 0), 0);

  if (total === 0) {
    return [];
  }

  const shown = parts.filter((part) => part.count > 0);
  const gapLength = shown.length > 1 ? gap : 0;
  const segments: RingSegment[] = [];
  let start = 0;

  for (const part of shown) {
    const length = (part.count / total) * RING_LENGTH;

    if (DRAWN_STATES.has(part.state)) {
      const drawn = Math.max(length - gapLength, 0);

      segments.push({
        state: part.state,
        dash: `${drawn} ${RING_LENGTH - drawn}`,
        offset: -(start + gapLength / 2),
      });
    }

    start += length;
  }

  return segments;
};

export type RingValueFit = 'full' | 'compact';

const FULL_DIGITS = 2;

export const ringValueFitOf = (value: string): RingValueFit =>
  value.length <= FULL_DIGITS ? 'full' : 'compact';
