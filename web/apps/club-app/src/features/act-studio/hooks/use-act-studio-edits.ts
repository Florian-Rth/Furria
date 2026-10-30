import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { TimedKeyframe } from '@/features/act-player/choreography-motion';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { StepText, StudioEdits, TimeSpan } from '../studio-edits';
import { NO_EDITS, withoutKeys } from '../studio-edits';

export interface ActStudioEdits {
  value: StudioEdits;
  keep: RefObject<number | null>;
  setBounds: (bounds: Record<number, TimeSpan>) => void;
  clearBounds: (stepIds: readonly number[]) => void;
  setText: (stepId: number, text: StepText) => void;
  clearText: (stepId: number, committed: StepText) => void;
  setTracks: (tracks: Record<number, readonly TimedKeyframe[]>) => void;
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
    clearBounds: (stepIds) => {
      setValue((current) => ({ ...current, bounds: withoutKeys(current.bounds, stepIds) }));
    },
    setText: (stepId, text) => {
      setValue((current) => ({ ...current, texts: { ...current.texts, [stepId]: text } }));
    },
    clearText: (stepId, committed) => {
      setValue((current) =>
        current.texts[stepId] === committed
          ? { ...current, texts: withoutKeys(current.texts, [stepId]) }
          : current,
      );
    },
    setTracks: (tracks) => {
      setValue((current) => ({ ...current, tracks: { ...current.tracks, ...tracks } }));
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
