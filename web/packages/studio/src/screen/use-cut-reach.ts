import type { MixPlayer } from '@furria/studio/mix-player';
import type { CutReach, CutRoom, CutSpan } from '@furria/studio/studio-cuts';
import { cutReachOf } from '@furria/studio/studio-cuts';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';

export const useCutReach = (
  player: MixPlayer,
  cut: CutSpan | null,
  room: CutRoom,
  playheadAt: (seconds: number) => number | null,
): CutReach => {
  const reachAt = (seconds: number): CutReach => cutReachOf(cut, playheadAt(seconds), room);
  const startHere = usePlaybackSelection(player, (seconds) => reachAt(seconds).startHere);
  const split = usePlaybackSelection(player, (seconds) => reachAt(seconds).split);
  const endHere = usePlaybackSelection(player, (seconds) => reachAt(seconds).endHere);

  return { startHere, split, endHere };
};
