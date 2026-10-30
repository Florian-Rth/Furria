import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { TimedKeyframe } from '@/features/act-player/choreography-motion';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { StepText, StudioEdits, TimeSpan } from '../studio-h-edits';
import { NO_EDITS } from '../studio-h-edits';

export interface StudioHEdits {
  value: StudioEdits;
  keep: RefObject<number | null>;
  setBounds: (bounds: Record<number, TimeSpan>) => void;
  setText: (stepId: number, text: StepText) => void;
  setTracks: (tracks: Record<number, readonly TimedKeyframe[]>) => void;
  setOffset: (videoId: number, seconds: number) => void;
  setCut: (songId: number, cut: TimeSpan, keepSeconds: number) => void;
}

export const useStudioHEdits = (): StudioHEdits => {
  const [value, setValue] = useState<StudioEdits>(NO_EDITS);
  const keep = useRef<number | null>(null);

  return {
    value,
    keep,
    setBounds: (bounds) => {
      setValue((current) => ({ ...current, bounds: { ...current.bounds, ...bounds } }));
    },
    setText: (stepId, text) => {
      setValue((current) => ({ ...current, texts: { ...current.texts, [stepId]: text } }));
    },
    setTracks: (tracks) => {
      setValue((current) => ({ ...current, tracks: { ...current.tracks, ...tracks } }));
    },
    setOffset: (videoId, seconds) => {
      setValue((current) => ({ ...current, offsets: { ...current.offsets, [videoId]: seconds } }));
    },
    setCut: (songId, cut, keepSeconds) => {
      keep.current = keepSeconds;
      setValue((current) => ({ ...current, cuts: { ...current.cuts, [songId]: cut } }));
    },
  };
};

export const useKeptPosition = (player: MixPlayer, keep: RefObject<number | null>): void => {
  const known = useRef(player);

  useEffect(() => {
    if (known.current === player) {
      return;
    }
    known.current = player;
    if (keep.current !== null) {
      player.seek(keep.current);
      keep.current = null;
    }
  }, [player, keep]);
};
