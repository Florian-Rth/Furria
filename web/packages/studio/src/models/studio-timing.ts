import { countEightsOf } from '@furria/studio/count-marks';
import type { CountMark, TimelineRange } from '@furria/studio/music-timeline';
import { EDGE_TOLERANCE_SECONDS } from '@furria/studio/music-timeline';

export interface CountCell {
  count: number;
  eight: number;
  start: number;
  end: number;
}

export const countCellsOf = (marks: readonly CountMark[], span: TimelineRange): CountCell[] => {
  const inside = marks.filter(
    (mark) =>
      mark.seconds >= span.start - EDGE_TOLERANCE_SECONDS &&
      mark.seconds < span.end - EDGE_TOLERANCE_SECONDS,
  );
  const eights = countEightsOf(inside);

  return inside.map((mark, index) => ({
    count: mark.count,
    eight: (eights[index] ?? 1) - 1,
    start: mark.seconds,
    end: inside[index + 1]?.seconds ?? span.end,
  }));
};
