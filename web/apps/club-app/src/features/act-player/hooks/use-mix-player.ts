import { useEffect, useState, useSyncExternalStore } from 'react';
import type { MixPlayer, MixPlayerState } from '../mix-player';
import { createMixPlayer } from '../mix-player';
import type { MusicSegment } from '../music-timeline';

export interface MixPlayerHandle {
  player: MixPlayer;
  state: MixPlayerState;
}

const signatureOf = (segments: readonly MusicSegment[]): string =>
  segments
    .map(
      (segment) =>
        `${segment.mediaItemId}:${segment.sourceStart}:${segment.sourceEnd}:${segment.audible}`,
    )
    .join('|');

export const useMixPlayer = (segments: readonly MusicSegment[]): MixPlayerHandle => {
  const signature = signatureOf(segments);
  const [player, setPlayer] = useState(() => createMixPlayer(segments));
  const [playerSignature, setPlayerSignature] = useState(signature);

  if (playerSignature !== signature) {
    setPlayerSignature(signature);
    setPlayer(createMixPlayer(segments));
  }

  useEffect(() => {
    void player.load();
    return () => {
      player.dispose();
    };
  }, [player]);

  const state = useSyncExternalStore(player.subscribe, player.state);

  return { player, state };
};
