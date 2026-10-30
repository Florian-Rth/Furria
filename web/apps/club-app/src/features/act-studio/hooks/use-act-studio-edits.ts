import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { TimedKeyframe } from '@/features/act-player/choreography-motion';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { StepText, StudioEdits, TimeSpan } from '../studio-edits';
import { NO_EDITS, tracksWithoutOf } from '../studio-edits';

export interface ActStudioEdits {
  value: StudioEdits;
  keep: RefObject<number | null>;
  setBounds: (bounds: Record<number, TimeSpan>) => void;
  setText: (stepId: number, text: StepText) => void;
  setTracks: (tracks: Record<number, readonly TimedKeyframe[]>) => void;
  dropTracks: (tracks: Record<number, readonly TimedKeyframe[]>) => void;
  setOffset: (videoId: number, seconds: number) => void;
  keepPosition: (seconds: number) => void;
}

export const useActStudioEdits = (): ActStudioEdits => {
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
    dropTracks: (tracks) => {
      setValue((current) => ({ ...current, tracks: tracksWithoutOf(current.tracks, tracks) }));
    },
    setOffset: (videoId, seconds) => {
      setValue((current) => ({ ...current, offsets: { ...current.offsets, [videoId]: seconds } }));
    },
    keepPosition: (seconds) => {
      keep.current = seconds;
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
