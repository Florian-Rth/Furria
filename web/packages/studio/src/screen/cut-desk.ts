import { cutClockOf, cutNudgeLabelOf, cutNudgeTextOf } from '@furria/studio/studio-copy';
import type { CutEdge, CutReach, CutSpan } from '@furria/studio/studio-cuts';
import {
  EARLIER_CUT_NUDGES,
  LATER_CUT_NUDGES,
  nudgedPiecesOf,
  roundedCutOf,
  splitPiecesOf,
  trimmedPiecesOf,
} from '@furria/studio/studio-cuts';
import type { SongDeskNudge } from '@furria/studio/use-song-desk';

const NO_VALUE = '–';

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
  pieces: readonly CutSpan[];
  index: number;
  limit: number | null;
  reach: CutReach;
  playhead: () => number | null;
  trim: (edge: CutEdge, pieces: CutSpan[]) => void;
  split: (at: number, pieces: CutSpan[]) => void;
}

export const cutDeskOf = (work: CutDeskWork): CutDesk => {
  const piece = work.pieces[work.index];
  const trimHere = (edge: CutEdge): void => {
    const at = work.playhead();
    const next =
      at === null ? null : trimmedPiecesOf(work.pieces, work.index, edge, at, work.limit);
    if (next !== null) {
      work.trim(edge, next);
    }
  };
  const splitHere = (): void => {
    const at = work.playhead();
    const next = at === null ? null : splitPiecesOf(work.pieces, work.index, at);
    if (at !== null && next !== null) {
      work.split(roundedCutOf(at), next);
    }
  };
  const lineOf = (edge: CutEdge): CutDeskLine => {
    const nudgeOf = (delta: number): SongDeskNudge => {
      const next = nudgedPiecesOf(work.pieces, work.index, edge, delta, work.limit);

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
    const value = edge === 'start' ? piece?.startSeconds : piece?.endSeconds;

    return {
      valueText: value === undefined ? NO_VALUE : cutClockOf(value),
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
