import type { KkPressRulerLane } from '../../press-ruler-data';

const PRESS_START_MS = 420;
const PRESS_SPAN_MS = 520;
const PRESS_STEP_MAX_MS = 12;

export interface RulerPress {
  firstOf: (laneKey: string) => number;
  delayOf: (order: number) => number;
}

export const rulerPressOf = (lanes: readonly KkPressRulerLane[]): RulerPress => {
  const oldestFirst = [...lanes].reverse();
  const total = lanes.reduce((sum, lane) => sum + lane.marks.length, 0);
  const step = total === 0 ? 0 : Math.min(PRESS_STEP_MAX_MS, PRESS_SPAN_MS / total);
  const firsts = new Map<string, number>();
  let order = 0;

  for (const lane of oldestFirst) {
    firsts.set(lane.key, order);
    order += lane.marks.length;
  }

  return {
    firstOf: (laneKey: string): number => firsts.get(laneKey) ?? 0,
    delayOf: (index: number): number => Math.round(PRESS_START_MS + index * step),
  };
};

export const pressOrderOf = (lane: KkPressRulerLane, first: number): Map<string, number> =>
  new Map(
    [...lane.marks]
      .sort((left, right) => left.share - right.share)
      .map((mark, index) => [mark.id, first + index]),
  );
