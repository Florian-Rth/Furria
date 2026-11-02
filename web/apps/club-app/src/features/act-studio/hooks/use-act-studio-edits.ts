import type { TimedKeyframe } from '@furria/studio/choreography-motion';
import type { MixPlayer } from '@furria/studio/mix-player';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { StudioEdits } from '../studio-edits';
import { NO_EDITS, tracksWithoutOf } from '../studio-edits';

export interface ActStudioEdits {
  value: StudioEdits;
  keep: RefObject<number | null>;
  setTracks: (tracks: Record<number, readonly TimedKeyframe[]>) => void;
  dropTracks: (tracks: Record<number, readonly TimedKeyframe[]>) => void;
  keepPosition: (seconds: number) => void;
}

export const useActStudioEdits = (): ActStudioEdits => {
  const [value, setValue] = useState<StudioEdits>(NO_EDITS);
  const keep = useRef<number | null>(null);

  return {
    value,
    keep,
    setTracks: (tracks) => {
      setValue((current) => ({ ...current, tracks: { ...current.tracks, ...tracks } }));
    },
    dropTracks: (tracks) => {
      setValue((current) => ({ ...current, tracks: tracksWithoutOf(current.tracks, tracks) }));
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
