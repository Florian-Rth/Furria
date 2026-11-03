import type { SpotPath } from '@furria/studio/choreography-motion';
import type { DeskTracks } from '@furria/studio/desk-keyframes';
import { keyedTracksOf, keyShiftedTracksOf } from '@furria/studio/desk-keyframes';
import { neighbourCountOf } from '@furria/studio/music-timeline';
import { snappedOf } from '@furria/studio/studio-edits';
import { useRef, useState } from 'react';
import { useTrackCommit } from '@/features/act-studio/hooks/use-track-commit';
import type { ActDesk } from './use-act-desk';

interface HeldKey {
  from: number;
  to: number;
  paths: readonly SpotPath[];
  shown: DeskTracks;
}

export interface DeskKeyDrag {
  heldAt: number | null;
  grab: (seconds: number) => void;
  move: (seconds: number) => void;
  drop: (seconds: number) => void;
  cancel: () => void;
  nudge: (seconds: number, direction: -1 | 1) => void;
}

const isEmpty = (tracks: DeskTracks): boolean => Object.keys(tracks).length === 0;

export const useDeskKeyDrag = (desk: ActDesk, shown: readonly SpotPath[]): DeskKeyDrag => {
  const { screen } = desk;
  const { playback, edits } = screen;
  const writes = useTrackCommit(screen);
  const held = useRef<HeldKey | null>(null);
  const [heldAt, setHeldAt] = useState<number | null>(null);

  const release = (): HeldKey | null => {
    const current = held.current;
    held.current = null;
    setHeldAt(null);
    if (current !== null) {
      edits.dropTracks(current.shown);
    }
    return current;
  };

  return {
    heldAt,
    grab: (seconds) => {
      held.current = { from: seconds, to: seconds, paths: shown, shown: {} };
      setHeldAt(seconds);
      desk.holdKey(seconds);
    },
    move: (seconds) => {
      const current = held.current;
      if (current === null) {
        return;
      }
      const to = snappedOf(playback.countMarks, seconds);
      const next = {
        ...keyedTracksOf(current.paths, current.from),
        ...keyShiftedTracksOf(current.paths, current.from, to),
      };
      writes.preview(next);
      held.current = { ...current, to, shown: next };
      setHeldAt(to);
    },
    drop: (seconds) => {
      const current = release();
      if (current === null) {
        return;
      }
      const to = snappedOf(playback.countMarks, seconds);
      const tracks = keyShiftedTracksOf(current.paths, current.from, to);
      if (!isEmpty(tracks)) {
        writes.commit(tracks);
        desk.holdKey(to);
      }
    },
    cancel: () => {
      release();
    },
    nudge: (seconds, direction) => {
      const to = neighbourCountOf(playback.countMarks, seconds, direction);
      if (to === null) {
        return;
      }
      const tracks = keyShiftedTracksOf(shown, seconds, to);
      if (!isEmpty(tracks)) {
        writes.commit(tracks);
        desk.focusKey(to);
      }
    },
  };
};
