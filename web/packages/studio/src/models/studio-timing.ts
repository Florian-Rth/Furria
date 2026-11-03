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
  let eight = 0;

  return inside.map((mark, index) => {
    if (index > 0 && mark.count === 1) {
      eight += 1;
    }

    return {
      count: mark.count,
      eight,
      start: mark.seconds,
      end: inside[index + 1]?.seconds ?? span.end,
    };
  });
};
