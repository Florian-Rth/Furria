import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { MusicSegment } from '@/features/act-player/music-timeline';
import { countAt } from '@/features/act-player/music-timeline';
import { hallCountLabelOf } from '../hall-copy';

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
