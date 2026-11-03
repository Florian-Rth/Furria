import { hallCountLabelOf } from '@furria/studio/hall-copy';
import type { MixPlayer } from '@furria/studio/mix-player';
import type { MusicSegment } from '@furria/studio/music-timeline';
import { countAt } from '@furria/studio/music-timeline';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';

export interface HallCount {
  count: number | null;
  leading: boolean;
  label: string;
}

export const useHallCount = (player: MixPlayer, segments: readonly MusicSegment[]): HallCount => {
  const lead = usePlaybackSelection(player, () => player.leadCount());
  const music = usePlaybackSelection(
    player,
    (seconds) => countAt(segments, seconds)?.count ?? null,
  );
  const leading = lead !== null;
  const count = lead ?? music;

  return { count, leading, label: hallCountLabelOf(count, leading) };
};
