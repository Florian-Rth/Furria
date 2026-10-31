import { useRef, useState } from 'react';
import { countSpanTextOf, movedDotsTextOf, STUDIO_PICK_DOTS } from '../studio-copy';
import type { StageShare } from '../studio-edits';
import type { CountSpan } from '../studio-timing';
import {
  cellIndexAt,
  cellSpanOf,
  countCellsOf,
  countSpanViewOf,
  eightsIn,
  orderedSpanOf,
} from '../studio-timing';
import type { ActStudioStage } from './use-act-studio-stage';
import type { StudioScreen } from './use-studio-screen';

export interface ActStudioCountCell {
  key: string;
  count: number;
  inRange: boolean;
  shown: boolean;
}

export interface ActStudioCountEight {
  key: string;
  cells: ActStudioCountCell[];
}

export interface ActStudioCounts {
  eights: ActStudioCountEight[];
  text: string;
  aside: string;
  accent: boolean;
  span: { start: number; end: number };
  press: (share: StageShare) => void;
  move: (share: StageShare) => void;
  end: (moved: boolean) => void;
}

const LABELLED_COUNTS = new Set([1, 5]);

export const useActStudioCounts = (
  screen: StudioScreen,
  editor: ActStudioStage,
): ActStudioCounts => {
  const { playback } = screen;
  const { countMarks, player } = playback;
  const { movement } = editor;
  const [draft, setDraft] = useState<CountSpan | null>(null);
  const anchor = useRef(0);
  const span = movement.span;
  const cells = countCellsOf(countMarks, span);
  const lead = movement.lead;
  const stored =
    lead === null ? null : cellSpanOf(cells, { start: lead.fromSeconds, end: lead.toSeconds });
  const shown = draft ?? stored;
  const groups = eightsIn(cells);
  const chosen = movement.movedSpots > 0;

  const seekTo = (index: number): void => {
    const cell = cells[index];
    if (cell !== undefined) {
      player.seek(cell.start);
    }
  };

  return {
    eights: groups.map((group, eight) => ({
      key: String(eight),
      cells: group.flatMap((index) => {
        const cell = cells[index];
        return cell === undefined
          ? []
          : [
              {
                key: String(index),
                count: cell.count,
                inRange: shown !== null && index >= shown.first && index <= shown.last,
                shown: LABELLED_COUNTS.has(cell.count),
              },
            ];
      }),
    })),
    text: chosen
      ? countSpanTextOf(shown === null ? null : countSpanViewOf(cells, shown), groups.length)
      : STUDIO_PICK_DOTS,
    aside: chosen ? movedDotsTextOf(movement.movedSpots) : '',
    accent: shown !== null && chosen,
    span,
    press: (share) => {
      if (cells.length === 0) {
        return;
      }
      anchor.current = cellIndexAt(cells, share.x);
      if (chosen && lead !== null) {
        setDraft({ first: anchor.current, last: anchor.current });
      }
    },
    move: (share) => {
      if (cells.length === 0) {
        return;
      }
      const index = cellIndexAt(cells, share.x);
      if (chosen && lead !== null) {
        setDraft(orderedSpanOf(anchor.current, index));
        return;
      }
      seekTo(index);
    },
    end: (moved) => {
      const first = draft === null ? undefined : cells[draft.first];
      const last = draft === null ? undefined : cells[draft.last];
      setDraft(null);
      if (!moved) {
        seekTo(anchor.current);
        return;
      }
      if (first !== undefined && last !== undefined) {
        movement.retime({ start: first.start, end: last.end });
      }
    },
  };
};
