import { useRef, useState } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import { countSpanTextOf, movedDotsTextOf, STUDIO_PICK_DOTS } from '../studio-copy';
import type { StageShare } from '../studio-edits';
import { moveIndexNear, retimedTrackOf } from '../studio-edits';
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
  end: () => void;
}

const LABELLED_COUNTS = new Set([1, 5]);

export const useActStudioCounts = (
  screen: StudioScreen,
  editor: ActStudioStage,
): ActStudioCounts => {
  const { playback, practice, edits } = screen;
  const { countMarks, paths, player } = playback;
  const [draft, setDraft] = useState<CountSpan | null>(null);
  const anchor = useRef(0);
  const step = practice.step;
  const span = { start: step?.startSeconds ?? 0, end: step?.endSeconds ?? 0 };
  const cells = countCellsOf(countMarks, span);
  const selectedPaths = paths.filter((path) => editor.selected.includes(path.spotId));
  const lead = selectedPaths[0] ?? null;
  const moveAt = usePlaybackSelection(player, (now) => {
    const index = lead === null ? null : moveIndexNear(lead.keyframes, span, now);
    return index === null ? -1 : index;
  });
  const moveIndex = moveAt < 0 ? null : moveAt;
  const moveFrom = moveIndex === null ? null : lead?.keyframes[moveIndex];
  const moveTo = moveIndex === null ? null : lead?.keyframes[moveIndex + 1];
  const stored =
    moveFrom === undefined || moveTo === undefined || moveFrom === null || moveTo === null
      ? null
      : cellSpanOf(cells, { start: moveFrom.seconds, end: moveTo.seconds });
  const shown = draft ?? stored;
  const groups = eightsIn(cells);

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
    text:
      selectedPaths.length === 0
        ? STUDIO_PICK_DOTS
        : countSpanTextOf(shown === null ? null : countSpanViewOf(cells, shown), groups.length),
    aside: selectedPaths.length === 0 ? '' : movedDotsTextOf(selectedPaths.length),
    accent: shown !== null && selectedPaths.length > 0,
    span,
    press: (share) => {
      if (selectedPaths.length === 0 || cells.length === 0) {
        return;
      }
      anchor.current = cellIndexAt(cells, share.x);
      setDraft({ first: anchor.current, last: anchor.current });
    },
    move: (share) => {
      if (selectedPaths.length === 0 || cells.length === 0) {
        return;
      }
      setDraft(orderedSpanOf(anchor.current, cellIndexAt(cells, share.x)));
    },
    end: () => {
      const first = draft === null ? undefined : cells[draft.first];
      const last = draft === null ? undefined : cells[draft.last];
      if (first !== undefined && last !== undefined) {
        const tracks: Record<number, ReturnType<typeof retimedTrackOf>> = {};
        for (const path of selectedPaths) {
          const index = moveIndexNear(path.keyframes, span, first.start);
          if (index !== null) {
            tracks[path.spotId] = retimedTrackOf(path.keyframes, index, {
              start: first.start,
              end: last.end,
            });
          }
        }
        edits.setTracks(tracks);
        player.seek(first.start);
      }
      setDraft(null);
    },
  };
};
