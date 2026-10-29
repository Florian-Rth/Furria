import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { videoAt } from '@/features/act-player/video-sync';
import type { Studio, StudioVideo } from '@/features/acts/schemas';

export const useMomentVideo = (playback: StudioPlayback, studio: Studio): StudioVideo | null => {
  const { player, parts, steps } = playback;
  const videoId = usePlaybackSelection(
    player,
    (seconds) => videoAt(studio.videos, parts, steps, seconds)?.videoId ?? null,
  );

  return studio.videos.find((video) => video.videoId === videoId) ?? null;
};
