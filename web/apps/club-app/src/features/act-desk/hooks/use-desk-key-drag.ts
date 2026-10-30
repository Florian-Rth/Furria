import { useState } from 'react';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import { useTrackCommit } from '@/features/act-studio/hooks/use-track-commit';
import { snappedOf } from '@/features/act-studio/studio-edits';
import type { DeskTracks } from '../desk-keyframes';
import { keyedTracksOf, keyShiftedTracksOf } from '../desk-keyframes';
import { neighbourCountOf } from '../desk-time';
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
  move: (share: number) => void;
  drop: () => void;
  nudge: (seconds: number, direction: -1 | 1) => void;
}

const isEmpty = (tracks: DeskTracks): boolean => Object.keys(tracks).length === 0;

export const useDeskKeyDrag = (desk: ActDesk, shown: readonly SpotPath[]): DeskKeyDrag => {
  const { screen } = desk;
  const { playback, edits } = screen;
  const writes = useTrackCommit(screen);
  const [held, setHeld] = useState<HeldKey | null>(null);

  return {
    heldAt: held?.to ?? null,
    grab: (seconds) => {
      setHeld({ from: seconds, to: seconds, paths: shown, shown: {} });
      desk.holdKey(seconds);
    },
    move: (share) => {
      if (held === null) {
        return;
      }
      const to = snappedOf(playback.countMarks, share * playback.length);
      const next = {
        ...keyedTracksOf(held.paths, held.from),
        ...keyShiftedTracksOf(held.paths, held.from, to),
      };
      writes.preview(next);
      setHeld({ ...held, to, shown: next });
    },
    drop: () => {
      if (held === null) {
        return;
      }
      setHeld(null);
      edits.dropTracks(held.shown);
      const tracks = keyShiftedTracksOf(held.paths, held.from, held.to);
      if (!isEmpty(tracks)) {
        writes.commit(tracks);
        desk.holdKey(held.to);
      }
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
