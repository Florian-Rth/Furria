import type { CentreTarget } from '@furria/studio/centre-targets';
import type { TimelineRange } from '@furria/studio/music-timeline';
import { TIMELINE_LANE } from '@furria/studio/studio-timeline-layers';

export interface ScoreTap {
  kind: 'part' | 'step';
  id: number;
}

export interface ScoreTarget extends CentreTarget {
  tap: ScoreTap;
}

interface Spanned {
  key: number;
  range: TimelineRange | null;
}

const spansOf = (items: readonly Spanned[], kind: ScoreTap['kind']): ScoreTarget[] =>
  items.flatMap((item) =>
    item.range === null
      ? []
      : [
          {
            key: `${kind}:${item.key}`,
            seconds: item.range.start,
            until: item.range.end,
            lane: kind === 'part' ? TIMELINE_LANE.parts : TIMELINE_LANE.steps,
            movable: false,
            tappable: true,
            tap: { kind, id: item.key },
          },
        ],
  );

export const scoreTargetsOf = (
  parts: readonly Spanned[],
  steps: readonly Spanned[],
  wide: boolean,
): ScoreTarget[] =>
  wide ? spansOf(steps, 'step') : [...spansOf(parts, 'part'), ...spansOf(steps, 'step')];

export const scoreTapOf = (targets: readonly ScoreTarget[], key: string): ScoreTap | null =>
  targets.find((target) => target.key === key)?.tap ?? null;
