import { cutClockOf, cutNudgeLabelOf, cutNudgeTextOf } from '@furria/studio/studio-copy';
import type { CutEdge, CutReach, CutRoom, CutSpan } from '@furria/studio/studio-cuts';
import {
  EARLIER_CUT_NUDGES,
  LATER_CUT_NUDGES,
  nudgedCutOf,
  splitPointOf,
  trimmedCutOf,
} from '@furria/studio/studio-cuts';
import type { SongDeskNudge } from '@furria/studio/use-song-desk';

export interface CutDeskAction {
  disabled: boolean;
  press: () => void;
}

export interface CutDeskLine {
  valueText: string;
  earlier: SongDeskNudge[];
  later: SongDeskNudge[];
}

export interface CutDesk {
  startHere: CutDeskAction;
  split: CutDeskAction;
  endHere: CutDeskAction;
  start: CutDeskLine;
  end: CutDeskLine;
}

export interface CutDeskWork {
  cut: CutSpan;
  room: CutRoom;
  reach: CutReach;
  playhead: () => number | null;
  trim: (edge: CutEdge, cut: CutSpan) => void;
  split: (at: number) => void;
}

export const cutDeskOf = (work: CutDeskWork): CutDesk => {
  const trimHere = (edge: CutEdge): void => {
    const at = work.playhead();
    const next = at === null ? null : trimmedCutOf(work.cut, edge, at, work.room);
    if (next !== null) {
      work.trim(edge, next);
    }
  };
  const splitHere = (): void => {
    const at = work.playhead();
    const point = at === null ? null : splitPointOf(work.cut, at);
    if (point !== null) {
      work.split(point);
    }
  };
  const lineOf = (edge: CutEdge): CutDeskLine => {
    const nudgeOf = (delta: number): SongDeskNudge => {
      const next = nudgedCutOf(work.cut, edge, delta, work.room);

      return {
        key: String(delta),
        text: cutNudgeTextOf(delta),
        label: cutNudgeLabelOf(edge, delta),
        disabled: next === null,
        press: () => {
          if (next !== null) {
            work.trim(edge, next);
          }
        },
      };
    };

    return {
      valueText: cutClockOf(edge === 'start' ? work.cut.startSeconds : work.cut.endSeconds),
      earlier: EARLIER_CUT_NUDGES.map(nudgeOf),
      later: LATER_CUT_NUDGES.map(nudgeOf),
    };
  };

  return {
    startHere: {
      disabled: !work.reach.startHere,
      press: () => {
        trimHere('start');
      },
    },
    split: { disabled: !work.reach.split, press: splitHere },
    endHere: {
      disabled: !work.reach.endHere,
      press: () => {
        trimHere('end');
      },
    },
    start: lineOf('start'),
    end: lineOf('end'),
  };
};
