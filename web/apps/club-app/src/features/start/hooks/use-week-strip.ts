import { entriesOf } from '../start-sheets';
import type { StripDay, StripMark } from '../week-strip';
import { toStripDays } from '../week-strip';
import type { StripDayFace } from '../week-strip-labels';
import { toStripDayFace } from '../week-strip-labels';
import type { StartBoard } from './use-start-view';

export interface StripCellMark {
  mark: StripMark;
  more: string | undefined;
}

export interface StripCell {
  day: StripDay;
  face: StripDayFace;
  marks: StripCellMark[];
  select: (() => void) | undefined;
}

export const useWeekStrip = (
  board: StartBoard | null,
  show: (isoDay: string) => void,
): StripCell[] | null => {
  if (board === null) {
    return null;
  }

  const entries = entriesOf(board.start);

  if (entries.length === 0) {
    return null;
  }

  return toStripDays(entries, board.start.today, board.now).map((day): StripCell => {
    const target = day.jumpTo;
    const face = toStripDayFace(day);
    const lastIndex = day.shown.length - 1;

    return {
      day,
      face,
      marks: day.shown.map((mark, index) => ({
        mark,
        more: index === lastIndex ? face.overflow : undefined,
      })),
      select:
        target === null
          ? undefined
          : () => {
              show(target);
            },
    };
  });
};
