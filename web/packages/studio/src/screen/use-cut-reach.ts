import type { MixPlayer } from '@furria/studio/mix-player';
import type { CutReach, CutSpan } from '@furria/studio/studio-cuts';
import { cutReachOf } from '@furria/studio/studio-cuts';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';

export const useCutReach = (
  player: MixPlayer,
  pieces: readonly CutSpan[],
  index: number,
  limit: number | null,
  playheadAt: (seconds: number) => number | null,
): CutReach => {
  const reachAt = (seconds: number): CutReach =>
    cutReachOf(pieces, index, playheadAt(seconds), limit);
  const startHere = usePlaybackSelection(player, (seconds) => reachAt(seconds).startHere);
  const split = usePlaybackSelection(player, (seconds) => reachAt(seconds).split);
  const endHere = usePlaybackSelection(player, (seconds) => reachAt(seconds).endHere);

  return { startHere, split, endHere };
};
