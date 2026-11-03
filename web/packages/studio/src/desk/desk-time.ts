import { countEightsOf } from '@furria/studio/count-marks';
import type { CountMark } from '@furria/studio/music-timeline';

const FALLBACK_BEAT_SECONDS = 0.5;
const BEAT_TICK_PX = 6;
const COUNT_LABEL_PX = 20;
const EIGHT_LABEL_PX = 18;
const COUNTS_PER_EIGHT = 8;

export interface DeskTick {
  key: string;
  seconds: number;
  strong: boolean;
  text: string | null;
}

export const beatSecondsOf = (marks: readonly CountMark[]): number => {
  const gaps = marks
    .slice(1)
    .map((mark, index) => mark.seconds - (marks[index]?.seconds ?? mark.seconds))
    .filter((gap) => gap > 0)
    .sort((left, right) => left - right);

  return gaps[Math.floor(gaps.length / 2)] ?? FALLBACK_BEAT_SECONDS;
};

export const musicTicksOf = (marks: readonly CountMark[], perSecond: number): DeskTick[] => {
  const beatPx = beatSecondsOf(marks) * perSecond;
  const eights = countEightsOf(marks);
  const everyCount = beatPx >= BEAT_TICK_PX;
  const eightLabels = beatPx * COUNTS_PER_EIGHT >= EIGHT_LABEL_PX;

  return marks.flatMap((mark, index) => {
    const one = mark.count === 1;
    if (!one && !everyCount) {
      return [];
    }
    const eight = eights[index];
    const eightText = eightLabels && eight !== undefined ? String(eight) : null;
    const countText = beatPx >= COUNT_LABEL_PX ? String(mark.count) : null;

    return [
      {
        key: String(index),
        seconds: mark.seconds,
        strong: one,
        text: one ? eightText : countText,
      },
    ];
  });
};
